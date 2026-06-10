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

const boatsDir = join(__dirname, '..', 'content', 'images', 'boats')

async function uploadImage(filename: string) {
  const filePath = join(boatsDir, filename)
  const imageBuffer = readFileSync(filePath)
  const asset = await client.assets.upload('image', imageBuffer, { filename })
  return {
    _type: 'image',
    _key: filename.replace(/[^a-zA-Z0-9]/g, ''),
    asset: {
      _type: 'reference',
      _ref: asset._id,
    },
  }
}

async function updateBoatGalleries() {
  console.log('Updating boat galleries...\n')

  // Get existing boats
  const boats = await client.fetch(`*[_type == "boat"]{ _id, name, model }`)

  const catalina = boats.find((b: any) => b.model.includes('Catalina'))
  const oceanis = boats.find((b: any) => b.model.includes('Oceanis'))

  if (!catalina || !oceanis) {
    console.error('Could not find boats!')
    return
  }

  // Upload Catalina 320 gallery photos
  console.log(`Updating ${catalina.name} (${catalina.model})...`)
  const catalinaPhotos = [
    'catalina320_1.jpg',
    'catalina320_2.jpg',
    'catalina320_3.jpg',
    'catalina320_4.jpg',
  ]

  const catalinaGallery = []
  for (const filename of catalinaPhotos) {
    console.log(`  Uploading ${filename}...`)
    const img = await uploadImage(filename)
    catalinaGallery.push(img)
  }

  await client.patch(catalina._id).set({ gallery: catalinaGallery }).commit()
  console.log(`  ✓ Added ${catalinaGallery.length} photos to gallery\n`)

  // Upload Oceanis 40.1 gallery photos
  console.log(`Updating ${oceanis.name} (${oceanis.model})...`)
  const oceanisPhotos = [
    'oceanis40_header.webp',
    'oceanis40_exterior2.webp',
    'oceanis40_exterior3.webp',
    'oceanis40_interior1.webp',
    'oceanis40_deck.webp',
  ]

  const oceanisGallery = []
  for (const filename of oceanisPhotos) {
    console.log(`  Uploading ${filename}...`)
    const img = await uploadImage(filename)
    oceanisGallery.push(img)
  }

  await client.patch(oceanis._id).set({ gallery: oceanisGallery }).commit()
  console.log(`  ✓ Added ${oceanisGallery.length} photos to gallery\n`)

  console.log('✅ Boat galleries updated!')
}

updateBoatGalleries().catch(console.error)
