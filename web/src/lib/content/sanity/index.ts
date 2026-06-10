/**
 * Sanity Content Provider
 *
 * This provider implements the content API using Sanity CMS.
 * Only files in this directory may import @sanity/* packages.
 *
 * @see SPEC-YOW-002 §3
 */

import type {
  SiteSettings,
  Boat,
  Course,
  Testimonial,
  GalleryPhoto,
  Video,
  VideoSection,
  Comment,
} from '../types'

import { client } from './client'
import * as queries from './queries'
import * as map from './map'

// =============================================================================
// Image URL - implemented in Part 2
// =============================================================================

export { imageUrl } from './image'

// =============================================================================
// Site Settings
// =============================================================================

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await client.fetch(queries.siteSettingsQuery)
  return map.mapSiteSettings(doc)
}

// =============================================================================
// Boats
// =============================================================================

export async function getBoats(): Promise<Boat[]> {
  const docs = await client.fetch(queries.boatsQuery)
  if (!Array.isArray(docs)) return []
  return docs.map(map.mapBoat).filter((b): b is Boat => b !== null)
}

export async function getBoat(slug: string): Promise<Boat | null> {
  const doc = await client.fetch(queries.boatBySlugQuery, { slug })
  return map.mapBoat(doc)
}

// =============================================================================
// Courses
// =============================================================================

export async function getCourses(): Promise<Course[]> {
  const docs = await client.fetch(queries.coursesQuery)
  if (!Array.isArray(docs)) return []
  return docs.map(map.mapCourse).filter((c): c is Course => c !== null)
}

export async function getCourse(slug: string): Promise<Course | null> {
  const doc = await client.fetch(queries.courseBySlugQuery, { slug })
  return map.mapCourse(doc)
}

// =============================================================================
// Testimonials
// =============================================================================

export async function getTestimonials(): Promise<Testimonial[]> {
  const docs = await client.fetch(queries.testimonialsQuery)
  if (!Array.isArray(docs)) return []
  return docs.map(map.mapTestimonial).filter((t): t is Testimonial => t !== null)
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  const docs = await client.fetch(queries.featuredTestimonialsQuery)
  if (!Array.isArray(docs)) return []
  return docs.map(map.mapTestimonial).filter((t): t is Testimonial => t !== null)
}

// =============================================================================
// Gallery
// =============================================================================

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const docs = await client.fetch(queries.galleryPhotosQuery)
  if (!Array.isArray(docs)) return []
  return docs.map(map.mapGalleryPhoto).filter((p): p is GalleryPhoto => p !== null)
}

export async function getFeaturedPhotos(): Promise<GalleryPhoto[]> {
  const docs = await client.fetch(queries.featuredPhotosQuery)
  if (!Array.isArray(docs)) return []
  return docs.map(map.mapGalleryPhoto).filter((p): p is GalleryPhoto => p !== null)
}

export async function getPhotosByCategory(category: string): Promise<GalleryPhoto[]> {
  const docs = await client.fetch(queries.photosByCategoryQuery, { category })
  if (!Array.isArray(docs)) return []
  return docs.map(map.mapGalleryPhoto).filter((p): p is GalleryPhoto => p !== null)
}

// =============================================================================
// Videos
// =============================================================================

export async function getFeaturedVideo(): Promise<Video | null> {
  const doc = await client.fetch(queries.featuredVideoQuery)
  return map.mapVideo(doc)
}

export async function getVideoSections(): Promise<VideoSection[]> {
  const docs = await client.fetch(queries.videoSectionsQuery)
  if (!Array.isArray(docs)) return []
  return docs.map(map.mapVideoSection).filter((s): s is VideoSection => s !== null)
}

// =============================================================================
// Comments
// =============================================================================

export async function getApprovedComments(): Promise<Comment[]> {
  const docs = await client.fetch(queries.approvedCommentsQuery)
  if (!Array.isArray(docs)) return []
  return docs.map(map.mapComment).filter((c): c is Comment => c !== null)
}
