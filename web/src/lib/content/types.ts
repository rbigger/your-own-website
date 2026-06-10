/**
 * Content Abstraction Layer - Domain Types
 * 
 * Vendor-neutral types for the content API. No CMS-specific types appear
 * in any signature. All slug fields are plain strings; all references are
 * resolved to nested domain objects; all images are ImageSource; rich text
 * fields are RichText.
 * 
 * @see SPEC-YOW-002 §4 Domain Model
 */

// =============================================================================
// Core Types
// =============================================================================

/**
 * Opaque image source type. The actual structure is provider-specific.
 * Use imageUrl() to convert to a URL with transform options.
 */
export interface ImageSource {
  /** Provider-specific image data - treat as opaque */
  _type: 'image'
  /** Provider-specific reference or URL */
  asset: unknown
}

/**
 * Rich text content serialized to HTML by the provider.
 * Render via the RichText component using set:html.
 */
export interface RichText {
  html: string
}

// =============================================================================
// Domain Types
// =============================================================================

export interface SiteSettings {
  siteName: string
  tagline?: string
  scheme?: string
  ownerName?: string
  ownerIntro?: string
  ownerBio?: RichText
  ownerPhoto?: ImageSource
  yearsTeaching?: number
  certifications?: string[]
  phone?: string
  email?: string
  location?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    youtube?: string
  }
  youtubeConfig?: {
    channelId?: string
    apiKey?: string
  }
}

export interface Boat {
  id: string
  name: string
  model: string
  slug: string
  role?: string
  loa?: string
  beam?: string
  draft?: string
  displacement?: string
  sailArea?: string
  engine?: string
  steering?: string
  features?: string[]
  whyThisBoat?: string
  photo?: ImageSource
  gallery?: ImageSource[]
}

export interface Course {
  id: string
  code?: string
  title: string
  slug: string
  tagline?: string
  summary?: string
  description?: RichText
  learningOutcomes?: string[]
  duration?: string
  schedule?: string
  boat?: Boat
  maxStudents?: number
  womenOnlyAvailable?: boolean
  priceFrom?: number
  priceNote?: string
  isBundle?: boolean
  bundleIncludes?: string
  bookingType?: string
  prerequisites?: string
  certification?: string
  image?: ImageSource
  sortOrder?: number
}

export interface Testimonial {
  id: string
  quote: string
  authorName: string
  authorPhoto?: ImageSource
  courseName?: string
  date?: string
  featured?: boolean
}

export interface GalleryPhoto {
  id: string
  image: ImageSource
  caption?: string
  category?: string
  featured?: boolean
  sortOrder?: number
}

export interface VideoCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  sortOrder?: number
}

export interface Video {
  id: string
  youtubeId: string
  title: string
  description?: string
  duration?: string
  durationSeconds?: number
  publishedAt?: string
  thumbnailUrl?: string
  category?: VideoCategory
  videoType?: 'video' | 'short'
  featured?: boolean
  tags?: string[]
  viewCount?: number
  sortOrder?: number
}

export interface VideoSection {
  id: string
  title: string
  slug: string
  description?: string
  displayStyle?: 'grid' | 'scroll' | 'large'
  sourceType?: 'manual' | 'category' | 'shorts'
  maxVideos?: number
  videos: Video[]
}

export interface Comment {
  id: string
  name: string
  comment: string
  submittedAt: string
}

// =============================================================================
// Image URL Options
// =============================================================================

export interface ImageUrlOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpg' | 'png'
}
