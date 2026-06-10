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

// Gallery photos from materials folder with categories
const galleryPhotos = [
  {
    filename: '706982358_1707813870530904_7618778546385938378_n.jpg',
    caption: 'Students learning at the helm',
    category: 'students',
    featured: true,
    sortOrder: 1,
  },
  {
    filename: '708501481_1707813980530893_2747850016073933957_n.jpg',
    caption: 'Sunset sailing on the Chesapeake',
    category: 'lifestyle',
    featured: true,
    sortOrder: 1,
  },
  {
    filename: '708489745_1707814033864221_8512967994646962841_n.jpg',
    caption: 'Taking the helm at the marina',
    category: 'students',
    featured: false,
    sortOrder: 2,
  },
  {
    filename: '706919326_1707814073864217_3529603496980495083_n.jpg',
    caption: 'Captain Alex at the dock',
    category: 'lifestyle',
    featured: false,
    sortOrder: 2,
  },
  {
    filename: '706891177_1707814110530880_797255906000524603_n.jpg',
    caption: 'Hands-on sail handling practice',
    category: 'students',
    featured: false,
    sortOrder: 3,
  },
  {
    filename: '708890878_1707814200530871_6425232340492240315_n.jpg',
    caption: 'Chart work and navigation planning',
    category: 'students',
    featured: false,
    sortOrder: 4,
  },
  {
    filename: '707137407_1707814243864200_1958756196306146931_n.jpg',
    caption: 'Crew in the cockpit',
    category: 'sailing',
    featured: false,
    sortOrder: 1,
  },
  {
    filename: '708866139_1707814280530863_8515483113048740604_n.jpg',
    caption: 'Pre-sail briefing',
    category: 'students',
    featured: false,
    sortOrder: 5,
  },
]

async function seedGallery() {
  console.log('Starting gallery photo upload...')
  console.log('Token loaded:', process.env.SANITY_TOKEN ? 'Yes (' + process.env.SANITY_TOKEN.substring(0, 8) + '...)' : 'NO!')
  console.log('')

  const materialsDir = join(__dirname, '..', 'materials', 'New Folder With Items')

  for (const photo of galleryPhotos) {
    try {
      const filePath = join(materialsDir, photo.filename)
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

  console.log('\n✅ Gallery seed complete!')
  console.log('Refresh your Sanity Studio to see the photos.')
}

seedGallery().catch(console.error)
