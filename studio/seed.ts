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

async function uploadImage(filePath: string, filename: string) {
  try {
    const imageBuffer = readFileSync(filePath)
    const asset = await client.assets.upload('image', imageBuffer, {
      filename,
    })
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    }
  } catch (error) {
    console.log(`Could not upload ${filename}, skipping...`)
    return null
  }
}

async function seed() {
  console.log('Starting seed...')

  // Upload boat images
  const contentDir = join(__dirname, '..', 'content', 'images', 'boats')

  console.log('Uploading Catalina 320 image...')
  const catalina320Photo = await uploadImage(
    join(contentDir, 'catalina320_1.jpg'),
    'catalina320_1.jpg'
  )

  console.log('Uploading Oceanis 40.1 image...')
  const oceanis40Photo = await uploadImage(
    join(contentDir, 'oceanis40_header.webp'),
    'oceanis40_header.webp'
  )

  // Create Boats
  console.log('Creating boats...')

  const catalina320 = await client.create({
    _type: 'boat',
    name: 'Windward Spirit',
    model: 'Catalina 320',
    slug: {_type: 'slug', current: 'windward-spirit'},
    role: 'Primary Training Vessel',
    loa: "32' 0\"",
    beam: "11' 9\"",
    draft: "4' 6\"",
    displacement: '10,500 lbs',
    sailArea: '470 sq ft',
    engine: 'Inboard diesel',
    steering: 'Wheel',
    features: [
      'Roller-furling jib',
      'Inboard diesel auxiliary',
      'Full instrumentation',
      'VHF radio',
      'Comfortable cockpit seating for 4 students',
    ],
    whyThisBoat: 'Industry standard for sailing instruction. Excellent stability for beginners with a spacious cockpit and good visibility. Wheel steering prepares you for larger boats.',
    photo: catalina320Photo,
  })
  console.log(`Created boat: ${catalina320._id}`)

  const oceanis40 = await client.create({
    _type: 'boat',
    name: 'Blue Horizon',
    model: 'Beneteau Oceanis 40.1',
    slug: {_type: 'slug', current: 'blue-horizon'},
    role: 'Advanced Training Vessel',
    loa: "39' 4\"",
    beam: "13' 1\"",
    draft: "6' 11\"",
    displacement: '17,857 lbs',
    sailArea: '861 sq ft',
    engine: 'Inboard diesel (45hp)',
    steering: 'Wheel',
    features: [
      'In-mast furling mainsail',
      'Self-tacking jib',
      'Bow thruster',
      'Full electronics (radar, chartplotter, AIS)',
      'Electric windlass',
      'Full galley',
      '3 cabin layout',
    ],
    whyThisBoat: 'Modern design matching charter fleet sizes. Full cruising amenities for liveaboard training with spacious accommodations for multi-day passages.',
    photo: oceanis40Photo,
  })
  console.log(`Created boat: ${oceanis40._id}`)

  // Create Courses
  console.log('Creating courses...')

  const courses = [
    {
      _type: 'course',
      code: 'ASA 101',
      title: 'Basic Keelboat Sailing',
      slug: {_type: 'slug', current: 'asa-101'},
      tagline: 'Learn to sail from scratch in just 3 days',
      summary: 'Your gateway to sailing. This foundational course teaches the fundamentals that apply to all sailboats - from basic terminology and sail trim to helm commands and navigation rules.',
      description: [{_type: 'block', _key: 'desc1', style: 'normal', children: [{_type: 'span', _key: 'span1', text: 'Your gateway to sailing. This foundational course teaches the fundamentals that apply to all sailboats - from basic terminology and sail trim to helm commands and navigation rules. No experience required.'}]}],
      learningOutcomes: [
        'Skipper a keelboat (20-27\') in light to moderate winds (up to 15 knots)',
        'Hoist, trim, and lower sails',
        'Execute tacking and jibing maneuvers',
        'Perform man overboard recovery',
        'Dock under power',
        'Tie essential sailing knots',
      ],
      duration: '3 days',
      schedule: '9am - 5pm',
      boat: {_type: 'reference', _ref: catalina320._id},
      maxStudents: 4,
      womenOnlyAvailable: true,
      priceFrom: 955,
      bookingType: 'online',
      prerequisites: 'None - beginners welcome',
      certification: 'ASA 101 Basic Keelboat Sailing',
      isBundle: false,
      sortOrder: 1,
    },
    {
      _type: 'course',
      code: 'ASA 103',
      title: 'Basic Coastal Cruising',
      slug: {_type: 'slug', current: 'asa-103'},
      tagline: 'Expand your skills for coastal adventures',
      summary: 'Take your sailing to the next level. Learn to cruise safely in coastal waters as both skipper and crew on larger auxiliary-powered sailboats.',
      description: [{_type: 'block', _key: 'desc1', style: 'normal', children: [{_type: 'span', _key: 'span1', text: 'Take your sailing to the next level. Learn to cruise safely in coastal waters as both skipper and crew on larger auxiliary-powered sailboats. Master boat systems, docking procedures, and coastal navigation basics.'}]}],
      learningOutcomes: [
        'Operate as skipper or crew on coastal day sails',
        'Handle auxiliary-powered sailboats (25-35\')',
        'Perform intermediate sail trim',
        'Operate and maintain diesel engines',
        'Execute docking and anchoring procedures',
        'Navigate using coastal methods',
      ],
      duration: '3 days',
      schedule: '9am - 5pm',
      boat: {_type: 'reference', _ref: catalina320._id},
      maxStudents: 4,
      womenOnlyAvailable: true,
      priceFrom: 990,
      bookingType: 'online',
      prerequisites: 'ASA 101 certification',
      certification: 'ASA 103 Basic Coastal Cruising',
      isBundle: false,
      sortOrder: 2,
    },
    {
      _type: 'course',
      code: 'ASA 104',
      title: 'Bareboat Cruising',
      slug: {_type: 'slug', current: 'asa-104'},
      tagline: 'Become charter-ready with multi-day cruising skills',
      summary: 'The certification charter companies require. Learn to skipper multi-day cruises independently, lead a crew, and handle challenging conditions up to 30 knots.',
      description: [{_type: 'block', _key: 'desc1', style: 'normal', children: [{_type: 'span', _key: 'span1', text: 'The certification charter companies require. Learn to skipper multi-day cruises independently, lead a crew, and handle challenging conditions up to 30 knots. Includes 2 nights living aboard.'}]}],
      learningOutcomes: [
        'Skipper 30-45\' sailboats on multi-day cruises',
        'Navigate in winds up to 30 knots',
        'Lead and manage a crew',
        'Provision for extended passages',
        'Plan and execute coastal passages',
        'Handle emergencies at sea',
      ],
      duration: '3 days (includes 2 nights aboard)',
      boat: {_type: 'reference', _ref: oceanis40._id},
      maxStudents: 4,
      womenOnlyAvailable: true,
      priceFrom: 1495,
      bookingType: 'online',
      prerequisites: 'ASA 101 + ASA 103 certification',
      certification: 'ASA 104 Bareboat Cruising (Charter-Ready)',
      isBundle: false,
      sortOrder: 3,
    },
    {
      _type: 'course',
      code: 'ASA 105',
      title: 'Coastal Navigation',
      slug: {_type: 'slug', current: 'asa-105'},
      tagline: 'Master the art and science of navigation',
      summary: 'Comprehensive navigation theory for coastal and inland waters. Learn chart reading, tide calculations, GPS operation, and passage planning.',
      description: [{_type: 'block', _key: 'desc1', style: 'normal', children: [{_type: 'span', _key: 'span1', text: 'Comprehensive navigation theory for coastal and inland waters. Learn chart reading, tide calculations, GPS operation, and passage planning. Classroom-based with optional online format.'}]}],
      learningOutcomes: [
        'Read and interpret nautical charts',
        'Use tide and current tables',
        'Plot dead reckoning positions',
        'Calculate fixes using terrestrial references',
        'Operate GPS and chartplotters',
        'Plan safe coastal passages',
      ],
      duration: '3 days classroom',
      maxStudents: 4,
      womenOnlyAvailable: false,
      priceFrom: 590,
      bookingType: 'online',
      prerequisites: 'ASA 104 certification (recommended)',
      certification: 'ASA 105 Coastal Navigation',
      isBundle: false,
      sortOrder: 4,
    },
    {
      _type: 'course',
      code: 'ASA 106',
      title: 'Advanced Coastal Cruising',
      slug: {_type: 'slug', current: 'asa-106'},
      tagline: 'Sail confidently in any conditions, day or night',
      summary: 'The ultimate coastal cruising certification. Learn to handle any conditions including night passages, heavy weather, and extended multi-day voyages.',
      description: [{_type: 'block', _key: 'desc1', style: 'normal', children: [{_type: 'span', _key: 'span1', text: 'The ultimate coastal cruising certification. Learn to handle any conditions including night passages, heavy weather, and extended multi-day voyages. Includes overnight passages with 3 nights aboard.'}]}],
      learningOutcomes: [
        'Skipper vessels up to 50\' in any coastal conditions',
        'Navigate day and night passages',
        'Handle heavy weather situations',
        'Execute advanced emergency procedures',
        'Manage 24-hour passages',
        'Lead crew through challenging conditions',
      ],
      duration: '4 days (includes 3 nights aboard + night sail)',
      boat: {_type: 'reference', _ref: oceanis40._id},
      maxStudents: 4,
      womenOnlyAvailable: false,
      priceFrom: 2200,
      bookingType: 'online',
      prerequisites: 'ASA 101 + 103 + 104 + 105 certification',
      certification: 'ASA 106 Advanced Coastal Cruising',
      isBundle: false,
      sortOrder: 5,
    },
    {
      _type: 'course',
      code: 'ASA 118',
      title: 'Docking Endorsement',
      slug: {_type: 'slug', current: 'asa-118'},
      tagline: 'Master close-quarters maneuvering with confidence',
      summary: 'Focused training on the skills that make sailors nervous - docking and maneuvering in tight spaces. Understand prop walk, wind effects, and spring line techniques.',
      description: [{_type: 'block', _key: 'desc1', style: 'normal', children: [{_type: 'span', _key: 'span1', text: 'Focused training on the skills that make sailors nervous - docking and maneuvering in tight spaces. Understand prop walk, wind effects, and spring line techniques.'}]}],
      learningOutcomes: [
        'Understand prop walk and pivot point effects',
        'Dock in various wind and current conditions',
        'Use spring lines effectively',
        'Execute tight-quarters maneuvers',
        'Communicate with crew during docking',
        'Perform emergency stops',
      ],
      duration: '1 day',
      schedule: '9am - 5pm',
      boat: {_type: 'reference', _ref: catalina320._id},
      maxStudents: 4,
      womenOnlyAvailable: false,
      priceFrom: 415,
      bookingType: 'online',
      prerequisites: 'ASA 101 (recommended)',
      certification: 'ASA 118 Docking Endorsement',
      isBundle: false,
      sortOrder: 6,
    },
    {
      _type: 'course',
      code: 'Bundle',
      title: 'Complete Beginner Bundle',
      slug: {_type: 'slug', current: 'beginner-bundle'},
      tagline: 'From first sail to charter-ready in one package',
      summary: 'Save 15% by bundling ASA 101, 103, and 104. Go from complete beginner to charter-ready certification in 9 days of training.',
      description: [{_type: 'block', _key: 'desc1', style: 'normal', children: [{_type: 'span', _key: 'span1', text: 'Save 15% by bundling ASA 101, 103, and 104. Go from complete beginner to charter-ready certification in 9 days of training. This is the most popular path for students planning to charter sailboats.'}]}],
      learningOutcomes: [
        'Complete ASA 101 Basic Keelboat certification',
        'Complete ASA 103 Basic Coastal Cruising certification',
        'Complete ASA 104 Bareboat Cruising certification',
        'Become charter-ready',
        'Save 15% vs individual courses',
      ],
      duration: '9 days total',
      maxStudents: 4,
      womenOnlyAvailable: true,
      priceFrom: 2925,
      priceNote: '15% discount included',
      bookingType: 'online',
      prerequisites: 'None - beginners welcome',
      certification: 'ASA 101 + 103 + 104',
      isBundle: true,
      bundleIncludes: 'ASA 101 + ASA 103 + ASA 104',
      sortOrder: 7,
    },
  ]

  for (const course of courses) {
    const created = await client.create(course)
    console.log(`Created course: ${course.code}`)
  }

  // Create Site Settings
  console.log('Creating site settings...')

  await client.create({
    _type: 'siteSettings',
    siteName: 'Example Studio',
    tagline: 'Learn to sail with confidence',
    ownerName: 'Alex Rivera',
    ownerBio: [
      {
        _type: 'block',
        _key: 'bio1',
        style: 'normal',
        children: [{_type: 'span', _key: 'span1', text: "Maybe you've watched sailboats from shore and wondered what it would feel like to be out there. The quiet. The wind filling the sails. No engine noise, no schedule - just you and the water."}],
      },
      {
        _type: 'block',
        _key: 'bio2',
        style: 'normal',
        children: [{_type: 'span', _key: 'span1', text: "I've spent twelve years teaching people to sail, and most of what I teach is a kind of attention. The taste of salt in the air. The wind playing across the surface of the water. The feel of the ocean working beneath your feet, and the sound of it flowing past the hull. Once you start taking all that in, the boat stops being a puzzle and starts telling you what it needs."}],
      },
      {
        _type: 'block',
        _key: 'bio3',
        style: 'normal',
        children: [{_type: 'span', _key: 'span1', text: "My approach is simple. We'll spend some time at the whiteboard so you can visualize what the wind is doing and how the boat will respond. Then we get on the water, and you do it yourself. What the hand does, the head remembers."}],
      },
    ],
    ownerIntro: "As a student you'll learn a sailor's skills and develop a sailor's awareness. Let's make that dream real.",
    yearsTeaching: 12,
    certifications: ['USCG Licensed Captain', 'ASA Certified Instructor'],
    phone: '(555) 123-4567',
    email: 'owner@example.com',
    location: 'Annapolis, Maryland',
  })
  console.log('Created site settings')

  // Create sample testimonials
  console.log('Creating testimonials...')

  const testimonials = [
    {
      _type: 'testimonial',
      quote: "Alex's patience and expertise made learning to sail a joy. By day three, I was confidently handling the boat on my own. Can't recommend highly enough!",
      authorName: 'Sarah M.',
      courseName: 'ASA 101',
      featured: true,
    },
    {
      _type: 'testimonial',
      quote: "I came in nervous about docking - it always seemed so stressful watching others. Alex's calm instruction and the hands-on practice completely changed that. Now it's my favorite part!",
      authorName: 'Michael R.',
      courseName: 'ASA 118',
      featured: true,
    },
    {
      _type: 'testimonial',
      quote: "The 104 course was everything I needed to feel confident chartering in the Caribbean. Three days of real sailing, real scenarios, real learning.",
      authorName: 'Jennifer L.',
      courseName: 'ASA 104',
      featured: true,
    },
  ]

  for (const testimonial of testimonials) {
    await client.create(testimonial)
    console.log(`Created testimonial from: ${testimonial.authorName}`)
  }

  console.log('\n✅ Seed complete!')
  console.log('Refresh your Sanity Studio to see the content.')
}

seed().catch(console.error)
