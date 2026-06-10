import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  fields: [
    defineField({
      name: 'youtubeId',
      title: 'YouTube URL or Video ID',
      type: 'string',
      description: 'Paste the full YouTube URL or just the video ID, then click "Fetch from YouTube"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Auto-populated from YouTube, can be overridden',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Auto-populated from YouTube, can be overridden',
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g., 5:59',
    }),
    defineField({
      name: 'durationSeconds',
      title: 'Duration (seconds)',
      type: 'number',
      description: 'Duration in seconds for sorting',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
    }),
    defineField({
      name: 'thumbnailUrl',
      title: 'Thumbnail URL',
      type: 'url',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'videoCategory'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'videoType',
      title: 'Video Type',
      type: 'string',
      options: {
        list: [
          {title: 'Full Video', value: 'video'},
          {title: 'Short', value: 'short'},
        ],
        layout: 'radio',
      },
      initialValue: 'video',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show this video in the featured section',
      initialValue: false,
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Auto-populated from YouTube',
    }),
    defineField({
      name: 'viewCount',
      title: 'View Count',
      type: 'number',
      description: 'Auto-populated from YouTube',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first (optional, defaults to publish date)',
    }),
  ],
  orderings: [
    {
      title: 'Publish Date (Newest)',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category.name',
      media: 'thumbnailUrl',
    },
    prepare({title, subtitle}) {
      return {
        title,
        subtitle: subtitle || 'Uncategorized',
      }
    },
  },
})
