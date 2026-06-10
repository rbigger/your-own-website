/**
 * Sanity Client
 *
 * Configures the Sanity client using SPEC-YOW-001 environment variables.
 * This is the only place @sanity/client is imported.
 *
 * @see SPEC-YOW-001 for env var design
 * @see SPEC-YOW-002 §3
 */

import { createClient } from '@sanity/client'

// Read configuration from environment variables (set in Cloudflare Pages)
const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID
const dataset = import.meta.env.PUBLIC_SANITY_DATASET
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION || '2024-01-01'

// Fail-fast validation
if (!projectId) {
  throw new Error('Missing required environment variable: PUBLIC_SANITY_PROJECT_ID')
}
if (!dataset) {
  throw new Error('Missing required environment variable: PUBLIC_SANITY_DATASET')
}

export const client = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion,
})

// Re-export for use in queries
export { projectId, dataset }
