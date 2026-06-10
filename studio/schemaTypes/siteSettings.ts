import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      description: 'The name of the business',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short tagline for header/hero',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'scheme',
      title: 'Color Scheme',
      type: 'string',
      description: 'Visual style for the site',
      options: {
        list: [
          {title: 'Ocean - Professional, trustworthy, established', value: 'ocean'},
          {title: 'Earth - Warm, grounded, natural', value: 'earth'},
          {title: 'Minimal - Clean, sophisticated, modern', value: 'minimal'},
          {title: 'Bold - Energetic, confident, action-oriented', value: 'bold'},
          {title: 'Elegant - Premium, refined, exclusive', value: 'elegant'},
          {title: 'Fresh - Friendly, approachable, optimistic', value: 'fresh'},
        ],
        layout: 'radio',
      },
      initialValue: 'ocean',
    }),
    defineField({
      name: 'ownerName',
      title: 'Owner Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ownerBio',
      title: 'Owner Bio',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Personal statement / about text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ownerIntro',
      title: 'Owner Intro',
      type: 'text',
      rows: 3,
      description: 'Short intro for homepage',
    }),
    defineField({
      name: 'ownerPhoto',
      title: 'Owner Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'yearsTeaching',
      title: 'Years Teaching',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'certifications',
      title: 'Certifications',
      type: 'array',
      of: [{type: 'string'}],
      description: 'List of credentials (USCG, ASA, etc.)',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Home port / service area',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        {name: 'instagram', title: 'Instagram', type: 'url'},
        {name: 'facebook', title: 'Facebook', type: 'url'},
        {name: 'youtube', title: 'YouTube', type: 'url'},
      ],
    }),
    defineField({
      name: 'youtubeConfig',
      title: 'YouTube Configuration',
      type: 'object',
      description: 'API credentials for fetching video metadata',
      fields: [
        {
          name: 'apiKey',
          title: 'API Key',
          type: 'string',
          description: 'YouTube Data API v3 key from Google Cloud Console',
        },
        {
          name: 'channelUrl',
          title: 'Channel URL',
          type: 'url',
          description: 'Your YouTube channel URL (e.g., https://www.youtube.com/@YourChannel)',
        },
        {
          name: 'channelId',
          title: 'Channel ID',
          type: 'string',
          description: 'YouTube channel ID (found in channel settings)',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'siteName',
      media: 'ownerPhoto',
    },
  },
})
