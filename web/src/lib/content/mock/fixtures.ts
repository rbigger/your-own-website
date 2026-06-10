/**
 * Mock Provider Fixtures
 * 
 * Sample data for testing without Sanity. These fixtures allow the site
 * to build and render with placeholder content.
 * 
 * @see SPEC-YOW-002 §7.3
 */

import type {
  SiteSettings,
  Boat,
  Course,
  Testimonial,
  GalleryPhoto,
  VideoCategory,
  Video,
  VideoSection,
  Comment,
  ImageSource,
  RichText,
} from '../types'

// Helper to create mock ImageSource
export function mockImage(id: string): ImageSource {
  return {
    _type: 'image',
    asset: { _ref: `mock-image-${id}` },
  }
}

// Helper to create mock RichText
export function mockRichText(html: string): RichText {
  return { html }
}

export const siteSettings: SiteSettings = {
  siteName: 'Mock Sailing School',
  tagline: 'Learn to sail with confidence',
  scheme: 'ocean',
  ownerName: 'Captain Mock',
  ownerIntro: 'Experienced sailing instructor',
  ownerBio: mockRichText('<p>This is a mock bio for testing purposes.</p>'),
  ownerPhoto: mockImage('owner'),
  yearsTeaching: 10,
  certifications: ['ASA Certified', 'USCG Licensed'],
  phone: '555-SAIL',
  email: 'mock@example.com',
  location: 'Mock Harbor, MD',
  socialLinks: {
    facebook: 'https://facebook.com/mock',
    instagram: 'https://instagram.com/mock',
    youtube: 'https://youtube.com/mock',
  },
}

export const boats: Boat[] = [
  {
    id: 'mock-boat-1',
    name: 'Mock Wind',
    model: 'Catalina 320',
    slug: 'mock-wind',
    role: 'instruction',
    loa: "32' 0\"",
    beam: "11' 9\"",
    draft: "4' 11\"",
    displacement: '11,400 lbs',
    sailArea: '555 sq ft',
    engine: 'Universal 25HP diesel',
    steering: 'Wheel',
    features: ['Roller furling', 'Autopilot', 'GPS chartplotter'],
    whyThisBoat: 'Perfect for learning the basics',
    photo: mockImage('boat-1'),
    gallery: [mockImage('boat-1-gallery-1'), mockImage('boat-1-gallery-2')],
  },
]

export const courses: Course[] = [
  {
    id: 'mock-course-1',
    code: 'MOCK-101',
    title: 'Basic Mock Sailing',
    slug: 'mock-101',
    tagline: 'Learn to sail from scratch',
    summary: 'A foundational course for beginners',
    description: mockRichText('<p>This mock course teaches sailing fundamentals.</p>'),
    learningOutcomes: ['Sail handling', 'Basic navigation', 'Safety procedures'],
    duration: '3 days',
    schedule: '9am - 5pm',
    boat: boats[0],
    maxStudents: 4,
    womenOnlyAvailable: true,
    priceFrom: 955,
    priceNote: 'Includes all materials',
    bookingType: 'jotform',
    prerequisites: 'None',
    certification: 'Mock Certification',
    image: mockImage('course-1'),
    sortOrder: 1,
  },
]

export const testimonials: Testimonial[] = [
  {
    id: 'mock-testimonial-1',
    quote: 'Great mock sailing experience!',
    authorName: 'Mock Student',
    authorPhoto: mockImage('testimonial-1'),
    courseName: 'MOCK-101',
    date: '2026-01-15',
    featured: true,
  },
]

export const galleryPhotos: GalleryPhoto[] = [
  {
    id: 'mock-photo-1',
    image: mockImage('gallery-1'),
    caption: 'Mock sailing adventure',
    category: 'sailing',
    featured: true,
    sortOrder: 1,
  },
  {
    id: 'mock-photo-2',
    image: mockImage('gallery-2'),
    caption: 'Mock students learning',
    category: 'students',
    featured: false,
    sortOrder: 2,
  },
]

export const videoCategories: VideoCategory[] = [
  {
    id: 'mock-category-1',
    name: 'Knots & Lines',
    slug: 'knots',
    description: 'Learn essential knots',
    icon: '🪢',
    sortOrder: 1,
  },
]

export const videos: Video[] = [
  {
    id: 'mock-video-1',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Mock Sailing Tutorial',
    description: 'Learn the basics of sailing',
    duration: '5:30',
    durationSeconds: 330,
    publishedAt: '2026-01-01T00:00:00Z',
    thumbnailUrl: 'https://placehold.co/480x360',
    category: videoCategories[0],
    videoType: 'video',
    featured: true,
    tags: ['sailing', 'tutorial'],
    viewCount: 1000,
    sortOrder: 1,
  },
]

export const videoSections: VideoSection[] = [
  {
    id: 'mock-section-1',
    title: 'Quick Tips',
    slug: 'quick-tips',
    description: 'Short tutorials',
    displayStyle: 'scroll',
    sourceType: 'shorts',
    maxVideos: 10,
    videos: videos.filter((v) => v.videoType === 'short'),
  },
  {
    id: 'mock-section-2',
    title: 'Knots & Lines',
    slug: 'knots',
    description: 'Essential knots',
    displayStyle: 'grid',
    sourceType: 'category',
    videos: videos.filter((v) => v.category?.slug === 'knots'),
  },
]

export const comments: Comment[] = [
  {
    id: 'mock-comment-1',
    name: 'Mock Commenter',
    comment: 'This is a mock comment for testing.',
    submittedAt: '2026-01-15T10:30:00Z',
  },
]
