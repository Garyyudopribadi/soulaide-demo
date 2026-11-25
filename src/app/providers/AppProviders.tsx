import React from 'react'
import { QueryProvider } from './QueryProvider.tsx'
import { AuthProvider } from '@/features/auth/AuthContext.tsx'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary.tsx'

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}
