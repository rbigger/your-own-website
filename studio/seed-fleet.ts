import 'dotenv/config'
import {createClient} from '@sanity/client'
import {readFileSync} from 'fs'
import {join} from 'path'

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

// Fleet photos from content/images/boats with captions
const fleetPhotos = [
  // Catalina 320
  {
    filename: 'catalina320_1.jpg',
    caption: 'Catalina 320 cabin - spacious salon with teak woodwork',
    category: 'boats',
    featured: true,
    sortOrder: 1,
  },
  {
    filename: 'catalina320_2.jpg',
    caption: 'Catalina 320 under full sail',
    category: 'boats',
    featured: false,
    sortOrder: 2,
  },
  {
    filename: 'catalina320_3.jpg',
    caption: 'Relaxed day sailing on the Catalina 320',
    category: 'boats',
    featured: false,
    sortOrder: 3,
  },
  {
    filename: 'catalina320_4.jpg',
    caption: 'Spacious cockpit perfect for learning',
    category: 'boats',
    featured: false,
    sortOrder: 4,
  },
  // Oceanis 40.1
  {
    filename: 'oceanis40_header.webp',
    caption: 'Oceanis 40.1 flying the spinnaker',
    category: 'boats',
    featured: true,
    sortOrder: 5,
  },
  {
    filename: 'oceanis40_exterior2.webp',
    caption: 'Oceanis 40.1 coastal cruising',
    category: 'boats',
    featured: false,
    sortOrder: 6,
  },
  {
    filename: 'oceanis40_exterior3.webp',
    caption: 'Oceanis 40.1 from above - clean deck layout',
    category: 'boats',
    featured: false,
    sortOrder: 7,
  },
  {
    filename: 'oceanis40_interior1.webp',
    caption: 'Master cabin with queen berth for liveaboard courses',
    category: 'boats',
    featured: false,
    sortOrder: 8,
  },
  {
    filename: 'oceanis40_deck.webp',
    caption: 'Oceanis 40.1 deck plan - dual helm stations',
    category: 'boats',
    featured: false,
    sortOrder: 9,
  },
]

async function seedFleet() {
  console.log('Starting fleet photo upload...')
  console.log('Token loaded:', process.env.SANITY_TOKEN ? 'Yes' : 'NO!')
  console.log('')

  const boatsDir = join(__dirname, '..', 'content', 'images', 'boats')

  for (const photo of fleetPhotos) {
    try {
      const filePath = join(boatsDir, photo.filename)
      console.log(`Uploading: ${photo.caption}...`)

      const imageBuffer = readFileSync(filePath)
      const asset = await client.assets.upload('image', imageBuffer, {
        filename: photo.filename,
      })

      await client.create({
        _type: 'galleryPhoto',
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        },
        caption: photo.caption,
        category: photo.category,
        featured: photo.featured,
        sortOrder: photo.sortOrder,
      })

      console.log(`  ✓ Created: ${photo.caption}`)
    } catch (error) {
      console.error(`  ✗ Failed: ${photo.filename}`, error)
    }
  }

  console.log('\n✅ Fleet photos uploaded!')
}

seedFleet().catch(console.error)
