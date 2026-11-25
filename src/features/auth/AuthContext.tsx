import React, { useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client.ts'
import type { UserRole } from '@/types/index.ts'
import { AuthContext, type UserProfile } from './auth-context.ts'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfileAndRole = useCallback(async (userId: string): Promise<UserRole> => {
    try {
      // 1. Fetch profile from Soulaide_profiles
      const { data: profileData } = await supabase
        .from('Soulaide_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileData) {
        setProfile({
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name,
          phone_number: profileData.phone_number,
          avatar_url: profileData.avatar_url,
        })
      }

      // 2. Fetch role from Soulaide_user_roles (safely prioritized)
      const { data: roleData } = await supabase
        .from('Soulaide_user_roles')
        .select('role')
        .eq('user_id', userId)

      let resolvedRole: UserRole = 'customer'
      if (roleData && roleData.length > 0) {
        const roles = roleData.map((r) => r.role as UserRole)
        if (roles.includes('super_admin')) {
          resolvedRole = 'super_admin'
        } else if (roles.includes('admin')) {
          resolvedRole = 'admin'
        } else if (roles.includes('psychologist')) {
          resolvedRole = 'psychologist'
        }
      }
      setRole(resolvedRole)
      return resolvedRole
    } catch (err) {
      console.error('[Soulaide Auth] Error loading profile/role:', err)
      setRole('customer')
      return 'customer'
    }
  }, [])

  const refreshProfile = useCallback(async (explicitUserId?: string): Promise<UserRole> => {
    const targetId = explicitUserId || user?.id
    if (targetId) {
      return await fetchProfileAndRole(targetId)
    }
    return 'customer'
  }, [user, fetchProfileAndRole])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Check active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        fetchProfileAndRole(currentSession.user.id).finally(() => {
          if (mounted) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    }).catch(() => {
      if (mounted) setLoading(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          await fetchProfileAndRole(newSession.user.id)
        } else {
          setProfile(null)
          setRole(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfileAndRole])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
