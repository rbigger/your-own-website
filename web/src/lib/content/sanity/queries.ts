/**
 * Sanity GROQ Queries
 *
 * All GROQ queries are defined here. Only this file contains GROQ strings.
 * Queries return raw Sanity documents - use mappers to convert to domain types.
 *
 * @see SPEC-YOW-002 §3
 */

// =============================================================================
// Site Settings
// =============================================================================

export const siteSettingsQuery = `*[_type == "siteSettings"][0]`

// =============================================================================
// Boats
// =============================================================================

export const boatsQuery = `*[_type == "boat"] | order(name asc)`

export const boatBySlugQuery = `*[_type == "boat" && slug.current == $slug][0]`

// =============================================================================
// Courses
// =============================================================================

export const coursesQuery = `*[_type == "course"] | order(sortOrder asc) {
  ...,
  boat->
}`

export const courseBySlugQuery = `*[_type == "course" && slug.current == $slug][0] {
  ...,
  boat->
}`

// =============================================================================
// Testimonials
// =============================================================================

export const testimonialsQuery = `*[_type == "testimonial"] | order(_createdAt desc)`

export const featuredTestimonialsQuery = `*[_type == "testimonial" && featured == true] | order(_createdAt desc)`

// =============================================================================
// Gallery
// =============================================================================

export const galleryPhotosQuery = `*[_type == "galleryPhoto"] | order(sortOrder asc)`

export const featuredPhotosQuery = `*[_type == "galleryPhoto" && featured == true] | order(sortOrder asc)`

export const photosByCategoryQuery = `*[_type == "galleryPhoto" && category == $category] | order(sortOrder asc)`

// =============================================================================
// Videos
// =============================================================================

export const featuredVideoQuery = `*[_type == "video" && featured == true][0] {
  ...,
  category->
}`

export const videoSectionsQuery = `*[_type == "videoSection" && visible == true] | order(sortOrder asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  displayStyle,
  sourceType,
  maxVideos,
  "videos": select(
    sourceType == "manual" => videos[]->{
      _id, youtubeId, title, description, duration, durationSeconds, thumbnailUrl, videoType, viewCount,
      "category": category->{_id, name, icon, "slug": slug.current}
    },
    sourceType == "category" => *[_type == "video" && category._ref == ^.category._ref] | order(publishedAt desc) {
      _id, youtubeId, title, description, duration, durationSeconds, thumbnailUrl, videoType, viewCount,
      "category": category->{_id, name, icon, "slug": slug.current}
    },
    sourceType == "shorts" => *[_type == "video" && videoType == "short"] | order(publishedAt desc) {
      _id, youtubeId, title, description, duration, durationSeconds, thumbnailUrl, videoType, viewCount,
      "category": category->{_id, name, icon, "slug": slug.current}
    }
  )
}`

// =============================================================================
// Comments
// =============================================================================

export const approvedCommentsQuery = `*[_type == "comment" && approved == true] | order(submittedAt desc) {
  _id,
  name,
  comment,
  submittedAt
}`
