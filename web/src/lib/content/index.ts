/**
 * Content Abstraction Layer - Page-Facing API
 *
 * This module exports all content functions and types that pages consume.
 * Functions delegate to the active provider (selected at build time via
 * CONTENT_PROVIDER env var and Vite alias).
 *
 * @see SPEC-YOW-002 §6 Page-facing API
 */

// Re-export all domain types
export type {
  ImageSource,
  RichText as RichTextData,
  ImageUrlOptions,
  SiteSettings,
  Boat,
  Course,
  Testimonial,
  GalleryPhoto,
  VideoCategory,
  Video,
  VideoSection,
  Comment,
} from './types'

// Re-export the RichText component (pages use this, not the type directly)
export { default as RichText } from './RichText.astro'

// =============================================================================
// Content Functions - delegated to active provider via build-time alias
// =============================================================================

// Import from virtual module - resolved by Vite alias to selected provider
// @ts-ignore - virtual module resolved at build time
import * as provider from 'virtual:yow-content-provider'

// Re-export all provider functions
export const imageUrl = provider.imageUrl
export const getSiteSettings = provider.getSiteSettings
export const getBoats = provider.getBoats
export const getBoat = provider.getBoat
export const getCourses = provider.getCourses
export const getCourse = provider.getCourse
export const getTestimonials = provider.getTestimonials
export const getFeaturedTestimonials = provider.getFeaturedTestimonials
export const getGalleryPhotos = provider.getGalleryPhotos
export const getFeaturedPhotos = provider.getFeaturedPhotos
export const getPhotosByCategory = provider.getPhotosByCategory
export const getFeaturedVideo = provider.getFeaturedVideo
export const getVideoSections = provider.getVideoSections
export const getApprovedComments = provider.getApprovedComments
