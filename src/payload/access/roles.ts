import type { Access, FieldAccess } from 'payload'

// Role model (task 1.2). Four roles with a strict capability ladder:
//   super-admin      → everything, incl. users + settings
//   editor           → all content, no users/settings
//   content-manager  → create/edit drafts; publish only posts/case-studies/faqs
//   viewer           → read everything + read/export form-submissions
export type Role = 'super-admin' | 'editor' | 'content-manager' | 'viewer'

export const ROLES: { label: string; value: Role }[] = [
  { label: 'Super Admin', value: 'super-admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Content Manager', value: 'content-manager' },
  { label: 'Viewer', value: 'viewer' },
]

// Accept `unknown` so the (possibly-untyped) Payload req.user is assignable
// without depending on generated payload-types. Role is read defensively.
export const hasRole = (user: unknown, ...roles: Role[]): boolean => {
  const role = (user as { role?: Role } | null | undefined)?.role
  return !!role && roles.includes(role)
}

export const isSuperAdmin = (user?: unknown) => hasRole(user, 'super-admin')
export const isEditorUp = (user?: unknown) => hasRole(user, 'super-admin', 'editor')
export const isContentManagerUp = (user?: unknown) =>
  hasRole(user, 'super-admin', 'editor', 'content-manager')

// ── Collection-level access (Access) ──────────────────────────
export const anyAuthenticated: Access = ({ req: { user } }) => !!user
export const superAdminOnly: Access = ({ req: { user } }) => isSuperAdmin(user)
export const editorUp: Access = ({ req: { user } }) => isEditorUp(user)
export const contentManagerUp: Access = ({ req: { user } }) => isContentManagerUp(user)

// ── Field-level access (FieldAccess) ──────────────────────────
export const superAdminFieldOnly: FieldAccess = ({ req: { user } }) => isSuperAdmin(user)

// Public read for published content; authenticated users see drafts too.
// (Draft visibility is additionally governed by the versions/drafts config.)
export const publicRead: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    _status: { equals: 'published' },
  }
}

// Fully public read — for globals and non-draft collections that have no _status
// field (a draft where-filter would be invalid there).
export const publicReadAlways: Access = () => true
