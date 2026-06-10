/**
 * Sanity Image URL Helper
 *
 * Converts ImageSource to URLs using @sanity/image-url.
 * Produces identical URLs to the original urlFor() implementation.
 *
 * @see SPEC-YOW-002 §5.1
 */

import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'
import { client } from './client'
import type { ImageSource, ImageUrlOptions } from '../types'

// Create the image URL builder
const builder = createImageUrlBuilder(client)

/**
 * Convert an ImageSource to a URL with optional transforms.
 *
 * @param source - The image source (from Sanity document)
 * @param opts - Optional transform options (width, height, quality, format)
 * @returns The CDN URL for the image
 */
export function imageUrl(source: ImageSource, opts?: ImageUrlOptions): string {
  // Cast to Sanity's expected type
  let img = builder.image(source as unknown as SanityImageSource)

  // Apply transforms
  if (opts?.width) {
    img = img.width(opts.width)
  }
  if (opts?.height) {
    img = img.height(opts.height)
  }
  if (opts?.quality) {
    img = img.quality(opts.quality)
  }
  if (opts?.format) {
    img = img.format(opts.format)
  }

  return img.url()
}
