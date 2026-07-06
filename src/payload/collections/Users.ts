import type { CollectionConfig } from 'payload'
import { ROLES, isSuperAdmin } from '../access/roles'

// Users (task 1.2). Auth with login rate-limit + lockout after 8 failed attempts;
// password reset email via Resend (configured on the payload email adapter).
// Only super-admins manage users; everyone can read/update their own record.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Production: lock after 8 failed attempts. Development: 0 = no lockout (so local
    // testing / automated login checks don't lock the account).
    maxLoginAttempts: process.env.NODE_ENV === 'production' ? 8 : 0,
    lockTime: 10 * 60 * 1000, // 10 minutes
    tokenExpiration: 60 * 60 * 8, // 8h sessions
    forgotPassword: {
      generateEmailSubject: () => 'Reset your Centrifuge World CMS password',
      generateEmailHTML: (args) => {
        const token = (args as { token?: string })?.token ?? ''
        const url = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/reset/${token}`
        return `<p>A password reset was requested for your Centrifuge World CMS account.</p>
          <p><a href="${url}">Reset your password</a> (link expires in 1 hour).</p>
          <p>If you didn't request this, you can ignore this email.</p>`
      },
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Admin',
  },
  access: {
    create: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
    read: ({ req: { user } }) =>
      isSuperAdmin(user) ? true : { id: { equals: user?.id } },
    update: ({ req: { user } }) =>
      isSuperAdmin(user) ? true : { id: { equals: user?.id } },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: { description: 'Profile photo (image, ≤2 MB — square-cropped on upload).' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'viewer',
      options: ROLES,
      // Only super-admins can change roles (incl. their own escalation is blocked
      // for non-super-admins).
      access: {
        update: ({ req: { user } }) => isSuperAdmin(user),
        create: ({ req: { user } }) => isSuperAdmin(user),
      },
    },
  ],
}
