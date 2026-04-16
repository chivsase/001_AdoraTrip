'use client'

import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import type { AuthContextType, LoginRequest, RegisterRequest, User } from '@/types/authTypes'
import { authApi, ApiError } from '@/utils/api'

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token')

      if (!token) {
        setUser(null)
        setIsLoading(false)

        return
      }

      const data = await authApi.me()

      setUser(data as unknown as User)
    } catch {
      // Token is invalid / expired — clear it
      localStorage.removeItem('access_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // On mount, try to load the user profile from the existing token
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(
    async (data: LoginRequest) => {
      const response = await authApi.login(data)

      localStorage.setItem('access_token', response.access)
      setUser(response.user as unknown as User)
      router.push('/home')
    },
    [router]
  )

  const register = useCallback(
    async (data: RegisterRequest) => {
      const response = await authApi.register(data)

      localStorage.setItem('access_token', response.access)
      setUser(response.user as unknown as User)
      router.push('/home')
    },
    [router]
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Even if the API call fails, clear local state
    }

    localStorage.removeItem('access_token')
    setUser(null)
    router.push('/login')
  }, [router])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
