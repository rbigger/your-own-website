import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Not displayed publicly',
    }),
    defineField({
      name: 'comment',
      title: 'Comment',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }),
    defineField({
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      description: 'Check to display on website',
      initialValue: false,
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'string',
      description: 'Which page this comment is for',
      options: {
        list: [
          {title: 'Testimonials', value: 'testimonials'},
          {title: 'General', value: 'general'},
        ],
      },
      initialValue: 'testimonials',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'comment',
      approved: 'approved',
    },
    prepare({title, subtitle, approved}) {
      return {
        title: `${approved ? '✓' : '○'} ${title}`,
        subtitle: subtitle?.substring(0, 50) + '...',
      }
    },
  },
})
