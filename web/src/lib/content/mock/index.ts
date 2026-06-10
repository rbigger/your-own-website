/**
 * Mock Content Provider
 * 
 * In-memory provider with fixtures for testing. No Sanity imports allowed.
 * Used to prove the abstraction holds (Part 6 decoupling proof).
 * 
 * @see SPEC-YOW-002 §7.3
 */

import type {
  ImageSource,
  ImageUrlOptions,
  SiteSettings,
  Boat,
  Course,
  Testimonial,
  GalleryPhoto,
  Video,
  VideoSection,
  Comment,
} from '../types'

// =============================================================================
// Image URL - returns placeholder
// =============================================================================

export function imageUrl(_source: ImageSource, opts?: ImageUrlOptions): string {
  const width = opts?.width || 400
  const height = opts?.height || 300
  return `https://placehold.co/${width}x${height}`
}

// =============================================================================
// Content Functions - return minimal fixtures (Part H will expand)
// =============================================================================

export async function getSiteSettings(): Promise<SiteSettings> {
  return {
    siteName: 'Mock Sailing School',
    tagline: 'Learn to sail with mock data',
  }
}

export async function getBoats(): Promise<Boat[]> {
  return []
}

export async function getBoat(_slug: string): Promise<Boat | null> {
  return null
}

export async function getCourses(): Promise<Course[]> {
  return []
}

export async function getCourse(_slug: string): Promise<Course | null> {
  return null
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return []
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  return []
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  return []
}

export async function getFeaturedPhotos(): Promise<GalleryPhoto[]> {
  return []
}

export async function getPhotosByCategory(_category: string): Promise<GalleryPhoto[]> {
  return []
}

export async function getFeaturedVideo(): Promise<Video | null> {
  return null
}

export async function getVideoSections(): Promise<VideoSection[]> {
  return []
}

export async function getApprovedComments(): Promise<Comment[]> {
  return []
}
