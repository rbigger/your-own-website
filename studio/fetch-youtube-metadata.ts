import 'dotenv/config'
import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) {
  throw new Error('Missing required environment variable: SANITY_STUDIO_PROJECT_ID')
}

const client = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion: '2024-01-01',
})

// Fetch YouTube API key from Sanity siteSettings
async function getYouTubeApiKey(): Promise<string | null> {
  const config = await client.fetch(`*[_type == "siteSettings"][0].youtubeConfig`)
  return config?.apiKey || null
}

interface YouTubeMetadata {
  youtubeId: string
  title: string
  description: string
  duration: string
  durationSeconds: number
  publishedAt: string
  thumbnailUrl: string
  tags: string[]
  viewCount: number
}

function parseDuration(isoDuration: string): { formatted: string; seconds: number } {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return { formatted: isoDuration, seconds: 0 }

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

  return { formatted, seconds: totalSeconds }
}

function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  // If it's already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url
  }

  return null
}

async function fetchYouTubeMetadata(urlOrId: string, apiKey: string): Promise<YouTubeMetadata | null> {
  const videoId = extractVideoId(urlOrId)
  if (!videoId) {
    console.error('Could not extract video ID from:', urlOrId)
    return null
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`

  try {
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      console.error('Video not found:', videoId)
      return null
    }

    const video = data.items[0]
    const { formatted, seconds } = parseDuration(video.contentDetails.duration)

    return {
      youtubeId: videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      duration: formatted,
      durationSeconds: seconds,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url,
      tags: video.snippet.tags || [],
      viewCount: parseInt(video.statistics.viewCount) || 0,
    }
  } catch (error) {
    console.error('Error fetching video metadata:', error)
    return null
  }
}

// CLI usage
const url = process.argv[2]
if (!url) {
  console.log('Usage: npx tsx fetch-youtube-metadata.ts <youtube-url-or-id>')
  console.log('Example: npx tsx fetch-youtube-metadata.ts https://youtu.be/Ic-wVvmtbes')
  process.exit(1)
}

async function main() {
  const apiKey = await getYouTubeApiKey()
  if (!apiKey) {
    console.error('ERROR: YouTube API key not found in Sanity siteSettings.')
    console.error('Please add your API key in the CMS under Site Settings > YouTube Configuration.')
    process.exit(1)
  }

  const metadata = await fetchYouTubeMetadata(url, apiKey)
  if (metadata) {
    console.log('\n Video Metadata:\n')
    console.log(JSON.stringify(metadata, null, 2))
    console.log('\n--- Sanity Document Format ---\n')
    console.log(`{
  _type: 'video',
  youtubeId: '${metadata.youtubeId}',
  title: '${metadata.title.replace(/'/g, "\\'")}',
  description: \`${metadata.description.substring(0, 200)}...\`,
  duration: '${metadata.duration}',
  durationSeconds: ${metadata.durationSeconds},
  publishedAt: '${metadata.publishedAt}',
  thumbnailUrl: '${metadata.thumbnailUrl}',
  tags: ${JSON.stringify(metadata.tags.slice(0, 5))},
  viewCount: ${metadata.viewCount},
  videoType: '${metadata.durationSeconds < 60 ? 'short' : 'video'}',
  featured: false,
}`)
  }
}

main().catch(console.error)

export { fetchYouTubeMetadata, extractVideoId }
