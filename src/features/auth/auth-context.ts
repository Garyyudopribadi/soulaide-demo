import { createContext } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import type { UserRole } from '@/types/index.ts'

export interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  phone_number: string | null
  avatar_url: string | null
}

export interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  role: UserRole | null
  loading: boolean
  refreshProfile: (explicitUserId?: string) => Promise<UserRole>
  signOut: () => Promise<void>
}

export const getRoleDashboardPath = (role?: UserRole | null): string => {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return '/admin'
    case 'psychologist':
      return '/psychologist'
    case 'customer':
    default:
      return '/dashboard'
  }
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
