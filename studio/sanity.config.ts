import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {fetchYouTubeMetadataAction} from './actions/fetchYouTubeMetadata'

// Read configuration from environment variables
const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// Fail-fast validation
if (!projectId) {
  throw new Error('Missing required environment variable: SANITY_STUDIO_PROJECT_ID')
}

export default defineConfig({
  name: 'default',
  title: 'Example Studio',

  projectId,
  dataset,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) => {
      // Add YouTube fetch action for video documents
      if (context.schemaType === 'video') {
        return [fetchYouTubeMetadataAction, ...prev]
      }
      return prev
    },
  },
})
