import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      description: 'The testimonial text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      description: 'e.g., John D. or Sarah M.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorPhoto',
      title: 'Author Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'courseName',
      title: 'Course Name',
      type: 'string',
      description: 'e.g., ASA 101',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show on homepage',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'authorName',
      subtitle: 'courseName',
      media: 'authorPhoto',
    },
  },
})
