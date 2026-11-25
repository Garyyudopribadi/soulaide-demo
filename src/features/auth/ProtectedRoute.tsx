import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.ts'
import { getRoleDashboardPath } from './auth-context.ts'
import { LoadingState } from '@/components/shared/LoadingState.tsx'
import type { UserRole } from '@/types/index.ts'

export interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingState message="Memeriksa otentikasi & hak akses..." />
      </div>
    )
  }

  // Not logged in -> Redirect to login with source location
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role authorization check
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = role && (allowedRoles.includes(role) || role === 'super_admin')
    if (!hasRole) {
      // If user is already authenticated with another valid role,
      // seamlessly redirect them to their proper dashboard instead of showing an unauthorized barrier
      if (role) {
        const correctPath = getRoleDashboardPath(role)
        if (
          location.pathname.startsWith('/dashboard') ||
          location.pathname.startsWith('/admin') ||
          location.pathname.startsWith('/psychologist')
        ) {
          return <Navigate to={correctPath} replace />
        }
      }

      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}
