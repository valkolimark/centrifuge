import { describe, it, expect } from 'vitest'
import {
  anyAuthenticated,
  superAdminOnly,
  editorUp,
  contentManagerUp,
  publicRead,
  isSuperAdmin,
  isEditorUp,
  isContentManagerUp,
  type Role,
} from '../roles'
import { preventNonEditorPublish } from '../../hooks/publishGuard'

// Loose signature so Payload's Access functions (which expect a full
// PayloadRequest) are assignable here with a minimal mock req.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AccessFn = (args: any) => unknown
const call = (fn: AccessFn, role: Role | null) =>
  fn({ req: { user: role ? { id: 1, role } : null } })

const ROLES: (Role | null)[] = ['super-admin', 'editor', 'content-manager', 'viewer', null]

describe('permission matrix — collection access', () => {
  // Expected boolean for each [access fn] × [role incl. anonymous].
  const matrix: Record<string, Record<string, boolean>> = {
    superAdminOnly: { 'super-admin': true, editor: false, 'content-manager': false, viewer: false, anon: false },
    editorUp: { 'super-admin': true, editor: true, 'content-manager': false, viewer: false, anon: false },
    contentManagerUp: { 'super-admin': true, editor: true, 'content-manager': true, viewer: false, anon: false },
    anyAuthenticated: { 'super-admin': true, editor: true, 'content-manager': true, viewer: true, anon: false },
  }
  const fns: Record<string, AccessFn> = {
    superAdminOnly,
    editorUp,
    contentManagerUp,
    anyAuthenticated,
  }

  for (const [name, expectations] of Object.entries(matrix)) {
    for (const role of ROLES) {
      const key = role ?? 'anon'
      it(`${name} → ${key} = ${expectations[key]}`, () => {
        expect(call(fns[name], role)).toBe(expectations[key])
      })
    }
  }
})

describe('publicRead', () => {
  it('returns true for any authenticated user', () => {
    expect(call(publicRead as AccessFn, 'viewer')).toBe(true)
  })
  it('restricts anonymous readers to published docs', () => {
    expect(call(publicRead as AccessFn, null)).toEqual({ _status: { equals: 'published' } })
  })
})

describe('role helpers', () => {
  it('ladder is correct', () => {
    expect(isSuperAdmin({ role: 'super-admin' })).toBe(true)
    expect(isSuperAdmin({ role: 'editor' })).toBe(false)
    expect(isEditorUp({ role: 'editor' })).toBe(true)
    expect(isEditorUp({ role: 'content-manager' })).toBe(false)
    expect(isContentManagerUp({ role: 'content-manager' })).toBe(true)
    expect(isContentManagerUp({ role: 'viewer' })).toBe(false)
    expect(isContentManagerUp(null)).toBe(false)
  })
})

describe('publishGuard — content-manager cannot publish guarded collections', () => {
  const args = (role: Role, next: string, prev: string) => ({
    data: { _status: next },
    req: { user: { id: 1, role } },
    originalDoc: { _status: prev },
  })

  it('throws when a content-manager publishes a draft', () => {
    // @ts-expect-error partial hook args are sufficient for this unit
    expect(() => preventNonEditorPublish(args('content-manager', 'published', 'draft'))).toThrow()
  })
  it('allows an editor to publish', () => {
    // @ts-expect-error partial hook args
    expect(() => preventNonEditorPublish(args('editor', 'published', 'draft'))).not.toThrow()
  })
  it('allows a content-manager to save a draft', () => {
    // @ts-expect-error partial hook args
    expect(() => preventNonEditorPublish(args('content-manager', 'draft', 'draft'))).not.toThrow()
  })
  it('allows re-saving an already-published doc', () => {
    // @ts-expect-error partial hook args
    expect(() => preventNonEditorPublish(args('content-manager', 'published', 'published'))).not.toThrow()
  })
})
