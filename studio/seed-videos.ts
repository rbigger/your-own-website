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
  useCdn: false,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2024-01-01',
})

// Fetch YouTube API key from Sanity siteSettings
async function getYouTubeApiKey(): Promise<string | null> {
  const config = await client.fetch(`*[_type == "siteSettings"][0].youtubeConfig`)
  return config?.apiKey || null
}

// Video categories
const categories = [
  { name: 'Knots & Lines', slug: 'knots', icon: '🪢', sortOrder: 1 },
  { name: 'Safety', slug: 'safety', icon: '🛟', sortOrder: 2 },
  { name: 'Sailing Skills', slug: 'skills', icon: '⛵', sortOrder: 3 },
  { name: 'Boat Maintenance', slug: 'maintenance', icon: '🔧', sortOrder: 4 },
  { name: 'Course Content', slug: 'courses', icon: '📚', sortOrder: 5 },
]

// Videos from Example Studio channel
const videos = [
  // Knots & Lines
  { id: 'ohUTklnE-r4', category: 'knots', type: 'short' },
  { id: 'bsN7mdO3rSg', category: 'knots', type: 'short' },
  { id: 'TC5GmDkxGbc', category: 'knots', type: 'short' },
  { id: '8UFyqIvhuaU', category: 'knots', type: 'short' },
  { id: 'IXsyRLWnc4s', category: 'knots', type: 'short' },
  { id: 'DSo33H1oQ8c', category: 'knots', type: 'short' },
  { id: '_zMgV944-bA', category: 'knots', type: 'short' },
  { id: 'wJP-tYkrnpM', category: 'knots', type: 'short' },
  { id: 'kpoDk0JsLMo', category: 'knots', type: 'short' },
  { id: 'QQom00lSWz4', category: 'knots', type: 'video' },
  { id: 'LjfsHxlAuDA', category: 'knots', type: 'short' },
  { id: 'RXH0a5Bnj30', category: 'knots', type: 'video' },

  // Safety
  { id: 'Ic-wVvmtbes', category: 'safety', type: 'video', featured: true },
  { id: 'UOu9kMwEYFQ', category: 'safety', type: 'video' },
  { id: '-crBOh_DQPY', category: 'safety', type: 'video' },

  // Sailing Skills
  { id: 'NRN9PvHt6sk', category: 'skills', type: 'video' },
  { id: 'pPMOXpCZqfo', category: 'skills', type: 'video' },
  { id: 'owgm6VsCG28', category: 'skills', type: 'video' },
  { id: '_sJvDK51IY4', category: 'skills', type: 'short' },

  // Course Content
  { id: 'frH3xRad4JQ', category: 'courses', type: 'video' },
  { id: 'IPQ4xlt1XtI', category: 'courses', type: 'video' },

  // Boat Maintenance
  { id: 'Bpl-wUuTNL0', category: 'maintenance', type: 'video' },
  { id: 'srASxL9iuss', category: 'maintenance', type: 'short' },
  { id: 'QDPaLy5kKaM', category: 'maintenance', type: 'short' },
  { id: 'wwCGKj1Ai4U', category: 'maintenance', type: 'video' },
]

async function fetchYouTubeMetadata(videoId: string, apiKey: string) {
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`
  const response = await fetch(apiUrl)
  const data = await response.json()

  if (!data.items || data.items.length === 0) return null

  const video = data.items[0]
  const duration = video.contentDetails.duration
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  const hours = match?.[1] ? parseInt(match[1]) : 0
  const minutes = match?.[2] ? parseInt(match[2]) : 0
  const seconds = match?.[3] ? parseInt(match[3]) : 0
  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  let formatted: string
  if (hours > 0) {
    formatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return {
    title: video.snippet.title,
    description: video.snippet.description,
    duration: formatted,
    durationSeconds: totalSeconds,
    publishedAt: video.snippet.publishedAt,
    thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url,
    tags: video.snippet.tags || [],
    viewCount: parseInt(video.statistics.viewCount) || 0,
  }
}

async function seedVideos() {
  console.log('Seeding video categories and videos...\n')

  // Get YouTube API key from Sanity
  const apiKey = await getYouTubeApiKey()
  if (!apiKey) {
    console.error('ERROR: YouTube API key not found in Sanity siteSettings.')
    console.error('Please add your API key in the CMS under Site Settings > YouTube Configuration.')
    process.exit(1)
  }
  console.log('✓ YouTube API key loaded from Sanity\n')

  // Create categories
  console.log('Creating categories...')
  const categoryRefs: Record<string, string> = {}

  for (const cat of categories) {
    const existing = await client.fetch(
      `*[_type == "videoCategory" && slug.current == $slug][0]._id`,
      { slug: cat.slug }
    )

    if (existing) {
      console.log(`  ✓ Category "${cat.name}" already exists`)
      categoryRefs[cat.slug] = existing
    } else {
      const doc = await client.create({
        _type: 'videoCategory',
        name: cat.name,
        slug: { _type: 'slug', current: cat.slug },
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      })
      console.log(`  ✓ Created category "${cat.name}"`)
      categoryRefs[cat.slug] = doc._id
    }
  }

  // Create videos
  console.log('\nFetching and creating videos...')

  for (const videoConfig of videos) {
    const existing = await client.fetch(
      `*[_type == "video" && youtubeId == $id][0]._id`,
      { id: videoConfig.id }
    )

    if (existing) {
      console.log(`  ✓ Video ${videoConfig.id} already exists`)
      continue
    }

    console.log(`  Fetching metadata for ${videoConfig.id}...`)
    const metadata = await fetchYouTubeMetadata(videoConfig.id, apiKey)

    if (!metadata) {
      console.log(`  ✗ Could not fetch metadata for ${videoConfig.id}`)
      continue
    }

    await client.create({
      _type: 'video',
      youtubeId: videoConfig.id,
      title: metadata.title,
      description: metadata.description,
      duration: metadata.duration,
      durationSeconds: metadata.durationSeconds,
      publishedAt: metadata.publishedAt,
      thumbnailUrl: metadata.thumbnailUrl,
      tags: metadata.tags.slice(0, 10),
      viewCount: metadata.viewCount,
      videoType: videoConfig.type,
      featured: videoConfig.featured || false,
      category: {
        _type: 'reference',
        _ref: categoryRefs[videoConfig.category],
      },
    })

    console.log(`  ✓ Created video: ${metadata.title}`)
  }

  console.log('\n✅ Seeding complete!')
}

seedVideos().catch(console.error)
