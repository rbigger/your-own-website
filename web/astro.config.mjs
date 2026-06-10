// @ts-check
import { defineConfig, envField } from 'astro/config';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';

// Content provider selection (SPEC-YOW-002 §6.1)
// The alias keeps only the selected provider in the build graph,
// enabling the decoupling proof in Part 6.
// @ts-ignore - process.env is available in Node.js config files
const contentProvider = process.env.CONTENT_PROVIDER || 'sanity';
const providerPath = fileURLToPath(
  new URL(`./src/lib/content/${contentProvider}/index.ts`, import.meta.url)
);

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        'virtual:yow-content-provider': providerPath,
      },
    },
  },
  env: {
    schema: {
      PUBLIC_SANITY_PROJECT_ID: envField.string({
        context: 'client',
        access: 'public',
      }),
      PUBLIC_SANITY_DATASET: envField.string({
        context: 'client',
        access: 'public',
      }),
      PUBLIC_SANITY_API_VERSION: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
        default: '2024-01-01',
      }),
      CONTENT_PROVIDER: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
        default: 'sanity',
      }),
      PUBLIC_ENABLE_COMMENTS: envField.boolean({
        context: 'client',
        access: 'public',
        default: true,
      }),
    },
  },
});