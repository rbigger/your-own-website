import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'videoSection',
  title: 'Video Section',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 50},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'displayStyle',
      title: 'Display Style',
      type: 'string',
      options: {
        list: [
          {title: 'Grid (3 columns)', value: 'grid'},
          {title: 'Horizontal Scroll', value: 'scroll'},
          {title: 'Large Cards (2 columns)', value: 'large'},
        ],
        layout: 'radio',
      },
      initialValue: 'grid',
    }),
    defineField({
      name: 'sourceType',
      title: 'Content Source',
      type: 'string',
      options: {
        list: [
          {title: 'Select videos manually', value: 'manual'},
          {title: 'All videos from a category', value: 'category'},
          {title: 'All Shorts', value: 'shorts'},
        ],
        layout: 'radio',
      },
      initialValue: 'manual',
    }),
    defineField({
      name: 'videos',
      title: 'Videos',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'video'}]}],
      hidden: ({document}) => document?.sourceType !== 'manual',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'videoCategory'}],
      hidden: ({document}) => document?.sourceType !== 'category',
    }),
    defineField({
      name: 'maxVideos',
      title: 'Max Videos to Show',
      type: 'number',
      description: 'Leave empty to show all',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'visible',
      title: 'Visible',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      sourceType: 'sourceType',
      visible: 'visible',
    },
    prepare({title, sourceType, visible}) {
      return {
        title: title,
        subtitle: `${sourceType} ${visible ? '' : '(hidden)'}`,
      }
    },
  },
})
