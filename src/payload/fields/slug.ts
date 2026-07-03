import type { Field } from 'payload'

// URL slug field with an auto-generating beforeValidate hook (from `title` or `name`).
export function slugField(sourceField = 'title'): Field {
  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'URL segment. Auto-generated from the title if left blank.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (value) return slugify(String(value))
          const source = data?.[sourceField] ?? data?.title ?? data?.name
          return source ? slugify(String(source)) : value
        },
      ],
    },
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
