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

const sections = [
  {
    title: 'Quick Tips',
    slug: 'quick-tips',
    description: 'Short tutorials you can watch in under a minute',
    displayStyle: 'scroll',
    sourceType: 'shorts',
    sortOrder: 1,
  },
  {
    title: 'Knots & Lines',
    slug: 'knots',
    description: 'Essential knots every sailor needs to know',
    displayStyle: 'grid',
    sourceType: 'category',
    categorySlug: 'knots',
    sortOrder: 2,
  },
  {
    title: 'Safety',
    slug: 'safety',
    description: 'Man overboard drills and safety procedures',
    displayStyle: 'large',
    sourceType: 'category',
    categorySlug: 'safety',
    sortOrder: 3,
  },
  {
    title: 'Sailing Skills',
    slug: 'skills',
    description: 'Tacking, jibing, and essential maneuvers',
    displayStyle: 'grid',
    sourceType: 'category',
    categorySlug: 'skills',
    sortOrder: 4,
  },
  {
    title: 'ASA Courses',
    slug: 'courses',
    description: 'American Sailing Association certification content',
    displayStyle: 'large',
    sourceType: 'category',
    categorySlug: 'courses',
    sortOrder: 5,
  },
  {
    title: 'Boat Maintenance',
    slug: 'maintenance',
    description: 'Keep your vessel in top condition',
    displayStyle: 'grid',
    sourceType: 'category',
    categorySlug: 'maintenance',
    sortOrder: 6,
  },
]

async function seedSections() {
  console.log('Creating video sections...\n')

  // Get category references
  const categories = await client.fetch(`*[_type == "videoCategory"]{_id, "slug": slug.current}`)
  const categoryMap: Record<string, string> = {}
  categories.forEach((cat: any) => {
    categoryMap[cat.slug] = cat._id
  })

  for (const section of sections) {
    const existing = await client.fetch(
      `*[_type == "videoSection" && slug.current == $slug][0]._id`,
      { slug: section.slug }
    )

    if (existing) {
      console.log(`  - Section "${section.title}" already exists`)
      continue
    }

    const doc: any = {
      _type: 'videoSection',
      title: section.title,
      slug: { _type: 'slug', current: section.slug },
      description: section.description,
      displayStyle: section.displayStyle,
      sourceType: section.sourceType,
      sortOrder: section.sortOrder,
      visible: true,
    }

    if (section.categorySlug && categoryMap[section.categorySlug]) {
      doc.category = {
        _type: 'reference',
        _ref: categoryMap[section.categorySlug],
      }
    }

    await client.create(doc)
    console.log(`  + Created section "${section.title}"`)
  }

  console.log('\nDone!')
}

seedSections().catch(console.error)
