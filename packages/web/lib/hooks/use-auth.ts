'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { User, ApiResponse } from '@/types'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  email: string
  password: string
  name: string
}

interface AuthResponse {
  user: User
  accessToken: string
}

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload)
      setAuth(data.data.user, data.data.accessToken)
      router.push('/projects')
    },
    [setAuth, router]
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await apiClient.post<ApiResponse<User>>('/auth/register', payload)
      router.push('/login')
    },
    [router]
  )

  const logout = useCallback(() => {
    clearAuth()
    router.push('/login')
  }, [clearAuth, router])

  const fetchMe = useCallback(async () => {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me')
    const token = useAuthStore.getState().token
    if (token) {
      setAuth(data.data, token)
    }
    return data.data
  }, [setAuth])

  return { user, isAuthenticated, login, register, logout, fetchMe }
}
