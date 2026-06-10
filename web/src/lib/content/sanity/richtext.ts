/**
 * Sanity Rich Text Serialization
 *
 * Converts Portable Text to HTML using @portabletext/to-html.
 * This is the only place Portable Text is handled - pages receive HTML.
 *
 * @see SPEC-YOW-002 §5.2 Option A
 */

import { toHTML } from '@portabletext/to-html'
import type { PortableTextBlock } from '@portabletext/types'
import type { RichText } from '../types'

/**
 * Convert Portable Text blocks to RichText (HTML string).
 *
 * @param blocks - Portable Text block array from Sanity
 * @returns RichText object with serialized HTML
 */
export function toRichText(blocks: PortableTextBlock[] | undefined | null): RichText | undefined {
  if (!blocks || blocks.length === 0) {
    return undefined
  }

  const html = toHTML(blocks)
  return { html }
}
