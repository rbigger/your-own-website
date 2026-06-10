/**
 * Sanity Document Mappers
 *
 * Convert raw Sanity documents to vendor-neutral domain types.
 * Handles: slug.current → string, references → nested objects,
 * images → ImageSource, Portable Text → RichText.
 *
 * @see SPEC-YOW-002 §4
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
} from '../types'
import { toRichText } from './richtext'

// =============================================================================
// Helper: Extract image as ImageSource
// =============================================================================

function mapImage(img: unknown): ImageSource | undefined {
  if (!img || typeof img !== 'object') return undefined
  const image = img as { _type?: string; asset?: unknown }
  if (image._type === 'image' && image.asset) {
    return {
      _type: 'image',
      asset: image.asset,
    }
  }
  return undefined
}

// =============================================================================
// Boat Mapper
// =============================================================================

export function mapBoat(doc: unknown): Boat | null {
  if (!doc || typeof doc !== 'object') return null
  const d = doc as Record<string, unknown>

  return {
    id: String(d._id || ''),
    name: String(d.name || ''),
    model: String(d.model || ''),
    slug: String((d.slug as { current?: string })?.current || ''),
    role: d.role ? String(d.role) : undefined,
    loa: d.loa ? String(d.loa) : undefined,
    beam: d.beam ? String(d.beam) : undefined,
    draft: d.draft ? String(d.draft) : undefined,
    displacement: d.displacement ? String(d.displacement) : undefined,
    sailArea: d.sailArea ? String(d.sailArea) : undefined,
    engine: d.engine ? String(d.engine) : undefined,
    steering: d.steering ? String(d.steering) : undefined,
    features: Array.isArray(d.features) ? d.features.map(String) : undefined,
    whyThisBoat: d.whyThisBoat ? String(d.whyThisBoat) : undefined,
    photo: mapImage(d.photo),
    gallery: Array.isArray(d.gallery)
      ? d.gallery.map(mapImage).filter((img): img is ImageSource => img !== undefined)
      : undefined,
  }
}

// =============================================================================
// Course Mapper
// =============================================================================

export function mapCourse(doc: unknown): Course | null {
  if (!doc || typeof doc !== 'object') return null
  const d = doc as Record<string, unknown>

  return {
    id: String(d._id || ''),
    code: d.code ? String(d.code) : undefined,
    title: String(d.title || ''),
    slug: String((d.slug as { current?: string })?.current || ''),
    tagline: d.tagline ? String(d.tagline) : undefined,
    summary: d.summary ? String(d.summary) : undefined,
    description: toRichText(d.description as Parameters<typeof toRichText>[0]),
    learningOutcomes: Array.isArray(d.learningOutcomes)
      ? d.learningOutcomes.map(String)
      : undefined,
    duration: d.duration ? String(d.duration) : undefined,
    schedule: d.schedule ? String(d.schedule) : undefined,
    boat: d.boat ? mapBoat(d.boat) ?? undefined : undefined,
    maxStudents: typeof d.maxStudents === 'number' ? d.maxStudents : undefined,
    womenOnlyAvailable: typeof d.womenOnlyAvailable === 'boolean' ? d.womenOnlyAvailable : undefined,
    priceFrom: typeof d.priceFrom === 'number' ? d.priceFrom : undefined,
    priceNote: d.priceNote ? String(d.priceNote) : undefined,
    isBundle: typeof d.isBundle === 'boolean' ? d.isBundle : undefined,
    bundleIncludes: d.bundleIncludes ? String(d.bundleIncludes) : undefined,
    bookingType: d.bookingType ? String(d.bookingType) : undefined,
    prerequisites: d.prerequisites ? String(d.prerequisites) : undefined,
    certification: d.certification ? String(d.certification) : undefined,
    image: mapImage(d.image),
    sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : undefined,
  }
}

// =============================================================================
// Site Settings Mapper
// =============================================================================

export function mapSiteSettings(doc: unknown): SiteSettings {
  if (!doc || typeof doc !== 'object') {
    return { siteName: 'Example Studio' }
  }
  const d = doc as Record<string, unknown>

  return {
    siteName: String(d.siteName || 'Example Studio'),
    tagline: d.tagline ? String(d.tagline) : undefined,
    scheme: d.scheme ? String(d.scheme) : undefined,
    ownerName: d.ownerName ? String(d.ownerName) : undefined,
    ownerIntro: d.ownerIntro ? String(d.ownerIntro) : undefined,
    ownerBio: toRichText(d.ownerBio as Parameters<typeof toRichText>[0]),
    ownerPhoto: mapImage(d.ownerPhoto),
    yearsTeaching: typeof d.yearsTeaching === 'number' ? d.yearsTeaching : undefined,
    certifications: Array.isArray(d.certifications) ? d.certifications.map(String) : undefined,
    phone: d.phone ? String(d.phone) : undefined,
    email: d.email ? String(d.email) : undefined,
    location: d.location ? String(d.location) : undefined,
    socialLinks: d.socialLinks as SiteSettings['socialLinks'],
    youtubeConfig: d.youtubeConfig as SiteSettings['youtubeConfig'],
  }
}

// =============================================================================
// Testimonial Mapper
// =============================================================================

export function mapTestimonial(doc: unknown): Testimonial | null {
  if (!doc || typeof doc !== 'object') return null
  const d = doc as Record<string, unknown>

  return {
    id: String(d._id || ''),
    quote: String(d.quote || ''),
    authorName: String(d.authorName || ''),
    authorPhoto: mapImage(d.authorPhoto),
    courseName: d.courseName ? String(d.courseName) : undefined,
    date: d.date ? String(d.date) : undefined,
    featured: typeof d.featured === 'boolean' ? d.featured : undefined,
  }
}

// =============================================================================
// Gallery Photo Mapper
// =============================================================================

export function mapGalleryPhoto(doc: unknown): GalleryPhoto | null {
  if (!doc || typeof doc !== 'object') return null
  const d = doc as Record<string, unknown>

  const image = mapImage(d.image)
  if (!image) return null

  return {
    id: String(d._id || ''),
    image,
    caption: d.caption ? String(d.caption) : undefined,
    category: d.category ? String(d.category) : undefined,
    featured: typeof d.featured === 'boolean' ? d.featured : undefined,
    sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : undefined,
  }
}

// =============================================================================
// Video Category Mapper
// =============================================================================

export function mapVideoCategory(doc: unknown): VideoCategory | null {
  if (!doc || typeof doc !== 'object') return null
  const d = doc as Record<string, unknown>

  return {
    id: String(d._id || ''),
    name: String(d.name || ''),
    slug: String((d.slug as { current?: string })?.current || d.slug || ''),
    description: d.description ? String(d.description) : undefined,
    icon: d.icon ? String(d.icon) : undefined,
    sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : undefined,
  }
}

// =============================================================================
// Video Mapper
// =============================================================================

export function mapVideo(doc: unknown): Video | null {
  if (!doc || typeof doc !== 'object') return null
  const d = doc as Record<string, unknown>

  return {
    id: String(d._id || ''),
    youtubeId: String(d.youtubeId || ''),
    title: String(d.title || ''),
    description: d.description ? String(d.description) : undefined,
    duration: d.duration ? String(d.duration) : undefined,
    durationSeconds: typeof d.durationSeconds === 'number' ? d.durationSeconds : undefined,
    publishedAt: d.publishedAt ? String(d.publishedAt) : undefined,
    thumbnailUrl: d.thumbnailUrl ? String(d.thumbnailUrl) : undefined,
    category: d.category ? mapVideoCategory(d.category) ?? undefined : undefined,
    videoType: d.videoType === 'short' || d.videoType === 'video' ? d.videoType : undefined,
    featured: typeof d.featured === 'boolean' ? d.featured : undefined,
    tags: Array.isArray(d.tags) ? d.tags.map(String) : undefined,
    viewCount: typeof d.viewCount === 'number' ? d.viewCount : undefined,
    sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : undefined,
  }
}

// =============================================================================
// Video Section Mapper
// =============================================================================

export function mapVideoSection(doc: unknown): VideoSection | null {
  if (!doc || typeof doc !== 'object') return null
  const d = doc as Record<string, unknown>

  return {
    id: String(d._id || ''),
    title: String(d.title || ''),
    slug: String(d.slug || ''),
    description: d.description ? String(d.description) : undefined,
    displayStyle: d.displayStyle as VideoSection['displayStyle'],
    sourceType: d.sourceType as VideoSection['sourceType'],
    maxVideos: typeof d.maxVideos === 'number' ? d.maxVideos : undefined,
    videos: Array.isArray(d.videos)
      ? d.videos.map(mapVideo).filter((v): v is Video => v !== null)
      : [],
  }
}

// =============================================================================
// Comment Mapper
// =============================================================================

export function mapComment(doc: unknown): Comment | null {
  if (!doc || typeof doc !== 'object') return null
  const d = doc as Record<string, unknown>

  return {
    id: String(d._id || ''),
    name: String(d.name || ''),
    comment: String(d.comment || ''),
    submittedAt: String(d.submittedAt || ''),
  }
}
