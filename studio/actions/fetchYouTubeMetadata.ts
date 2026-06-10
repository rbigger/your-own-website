import {DocumentActionComponent, useClient} from 'sanity'
import {useState} from 'react'

// Extract video ID from various YouTube URL formats
function extractVideoId(input: string): string | null {
  if (!input) return null

  // Already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input
  }

  // URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }

  return null
}

// Parse ISO 8601 duration to readable format
function parseDuration(isoDuration: string): {formatted: string; seconds: number} {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return {formatted: isoDuration, seconds: 0}

  const hours = match[1] ? parseInt(match[1]) : 0
  const minutes = match[2] ? parseInt(match[2]) : 0
  const seconds = match[3] ? parseInt(match[3]) : 0

  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  let formatted: string
  if (hours > 0) {
    formatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return {formatted, seconds: totalSeconds}
}

export const fetchYouTubeMetadataAction: DocumentActionComponent = (props) => {
  const {id, type, draft, published, onComplete} = props
  const [isLoading, setIsLoading] = useState(false)
  const client = useClient({apiVersion: '2024-01-01'})

  // Only show for video documents
  if (type !== 'video') return null

  const doc = draft || published
  const youtubeIdOrUrl = doc?.youtubeId as string

  return {
    label: isLoading ? 'Fetching...' : 'Fetch from YouTube',
    icon: () => '▶',
    disabled: !youtubeIdOrUrl || isLoading,
    onHandle: async () => {
      setIsLoading(true)

      try {
        // Extract video ID
        const videoId = extractVideoId(youtubeIdOrUrl)
        if (!videoId) {
          alert('Invalid YouTube URL or ID')
          setIsLoading(false)
          return
        }

        // Get API key from siteSettings
        const settings = await client.fetch(`*[_type == "siteSettings"][0].youtubeConfig`)
        const apiKey = settings?.apiKey

        if (!apiKey) {
          alert('YouTube API key not found. Please add it in Site Settings > YouTube Configuration.')
          setIsLoading(false)
          return
        }

        // Fetch from YouTube API
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`
        const response = await fetch(apiUrl)
        const data = await response.json()

        if (!data.items || data.items.length === 0) {
          alert('Video not found on YouTube')
          setIsLoading(false)
          return
        }

        const video = data.items[0]
        const {formatted, seconds} = parseDuration(video.contentDetails.duration)

        // Determine video type based on duration
        const videoType = seconds < 60 ? 'short' : 'video'

        // Patch the document
        await client
          .patch(draft?._id || id)
          .set({
            youtubeId: videoId,
            title: video.snippet.title,
            description: video.snippet.description,
            duration: formatted,
            durationSeconds: seconds,
            publishedAt: video.snippet.publishedAt,
            thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url,
            tags: (video.snippet.tags || []).slice(0, 10),
            viewCount: parseInt(video.statistics.viewCount) || 0,
            videoType: videoType,
          })
          .commit()

        alert(`Fetched: "${video.snippet.title}"`)

      } catch (error) {
        console.error('Error fetching YouTube metadata:', error)
        alert('Error fetching metadata. Check console for details.')
      }

      setIsLoading(false)
      onComplete()
    },
  }
}
