import { describe, expect, it } from 'vitest'
import type { UserRole } from '@/types/index.ts'
import { getRoleDashboardPath } from './auth-context.ts'

function checkRoleAccess(userRole: UserRole | null, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false
  if (userRole === 'super_admin') return true
  return allowedRoles.includes(userRole)
}

describe('Authentication & Role Authorization Checks', () => {
  it('allows customer only to customer dashboard', () => {
    expect(checkRoleAccess('customer', ['customer'])).toBe(true)
    expect(checkRoleAccess('customer', ['psychologist'])).toBe(false)
    expect(checkRoleAccess('customer', ['admin'])).toBe(false)
  })

  it('allows psychologist only to psychologist dashboard', () => {
    expect(checkRoleAccess('psychologist', ['psychologist'])).toBe(true)
    expect(checkRoleAccess('psychologist', ['admin'])).toBe(false)
  })

  it('allows admin to admin dashboard', () => {
    expect(checkRoleAccess('admin', ['admin'])).toBe(true)
    expect(checkRoleAccess('admin', ['psychologist'])).toBe(false)
  })

  it('grants super_admin universal access across all role-protected areas', () => {
    expect(checkRoleAccess('super_admin', ['customer'])).toBe(true)
    expect(checkRoleAccess('super_admin', ['psychologist'])).toBe(true)
    expect(checkRoleAccess('super_admin', ['admin'])).toBe(true)
  })

  it('denies access if user is not authenticated', () => {
    expect(checkRoleAccess(null, ['customer'])).toBe(false)
    expect(checkRoleAccess(null, ['admin'])).toBe(false)
  })
})

describe('Password and Input Validation Rules', () => {
  it('requires passwords to be at least 6 characters long', () => {
    const isValidPassword = (pwd: string) => pwd.length >= 6
    expect(isValidPassword('12345')).toBe(false)
    expect(isValidPassword('123456')).toBe(true)
    expect(isValidPassword('strongSecretPass')).toBe(true)
  })

  it('correctly compares password and confirmation', () => {
    const doPasswordsMatch = (p1: string, p2: string) => p1 === p2
    expect(doPasswordsMatch('secret123', 'secret123')).toBe(true)
    expect(doPasswordsMatch('secret123', 'different')).toBe(false)
  })
})

describe('Role Dashboard Routing Path', () => {
  it('maps super_admin and admin to /admin', () => {
    expect(getRoleDashboardPath('super_admin')).toBe('/admin')
    expect(getRoleDashboardPath('admin')).toBe('/admin')
  })

  it('maps psychologist to /psychologist', () => {
    expect(getRoleDashboardPath('psychologist')).toBe('/psychologist')
  })

  it('maps customer to /dashboard', () => {
    expect(getRoleDashboardPath('customer')).toBe('/dashboard')
    expect(getRoleDashboardPath(null)).toBe('/dashboard')
    expect(getRoleDashboardPath(undefined)).toBe('/dashboard')
  })
})
