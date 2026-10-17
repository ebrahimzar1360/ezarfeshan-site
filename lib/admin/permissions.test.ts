import { describe, expect, it } from 'vitest'
import { PERMISSIONS, can } from './permissions'

describe('permissions', () => {
  it('gives ADMIN everything', () => {
    for (const p of PERMISSIONS) expect(can('ADMIN', p)).toBe(true)
  })

  it('keeps users and audit away from EDITOR', () => {
    expect(can('EDITOR', 'users.manage')).toBe(false)
    expect(can('EDITOR', 'audit.view')).toBe(false)
    expect(can('EDITOR', 'content.edit')).toBe(true)
    expect(can('EDITOR', 'articles.publish')).toBe(true)
  })

  it('lets AUTHOR write but not publish', () => {
    expect(can('AUTHOR', 'articles.write')).toBe(true)
    expect(can('AUTHOR', 'articles.publish')).toBe(false)
    expect(can('AUTHOR', 'articles.editAny')).toBe(false)
    expect(can('AUTHOR', 'content.edit')).toBe(false)
  })

  it('denies unknown roles', () => {
    expect(can(undefined, 'articles.write')).toBe(false)
    expect(can('ROOT', 'articles.write')).toBe(false)
  })
})
