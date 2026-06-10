import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'boat',
  title: 'Boat',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Boat Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'model',
      title: 'Model',
      type: 'string',
      description: 'e.g., Catalina 320',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g., Primary Trainer, Advanced Trainer',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'loa',
      title: 'Length Overall (LOA)',
      type: 'string',
      description: 'e.g., 32\' 0"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'beam',
      title: 'Beam',
      type: 'string',
      description: 'e.g., 11\' 9"',
    }),
    defineField({
      name: 'draft',
      title: 'Draft',
      type: 'string',
      description: 'e.g., 4\' 6"',
    }),
    defineField({
      name: 'displacement',
      title: 'Displacement',
      type: 'string',
      description: 'e.g., 10,500 lbs',
    }),
    defineField({
      name: 'sailArea',
      title: 'Sail Area',
      type: 'string',
      description: 'e.g., 470 sq ft',
    }),
    defineField({
      name: 'engine',
      title: 'Engine',
      type: 'string',
      description: 'e.g., Inboard diesel',
    }),
    defineField({
      name: 'steering',
      title: 'Steering',
      type: 'string',
      description: 'Wheel or Tiller',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Roller-furling jib, VHF radio, etc.',
    }),
    defineField({
      name: 'whyThisBoat',
      title: 'Why This Boat',
      type: 'text',
      rows: 4,
      description: 'Marketing description of why this boat is great for training',
    }),
    defineField({
      name: 'photo',
      title: 'Primary Photo',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'model',
      media: 'photo',
    },
  },
})
