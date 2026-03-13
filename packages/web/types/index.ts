export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  provider: 'email' | 'google'
  role: 'user' | 'admin'
}

export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  thumbnailUrl?: string
  sceneData: Record<string, unknown>
  settings: Record<string, unknown>
  isPublic: boolean
  shareToken?: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T
  meta?: Record<string, unknown>
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    perPage: number
  }
}
