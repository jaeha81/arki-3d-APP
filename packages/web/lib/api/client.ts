const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const BASE = `${API_BASE_URL}/api/v1`

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: unknown
  ) {
    super(`API Error ${status}`)
    this.name = 'ApiError'
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30_000)

  try {
    const token = getToken()
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    })

    if (res.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
      throw new ApiError(401, { message: 'Unauthorized' })
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new ApiError(res.status, errData)
    }

    // 204 No Content
    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
  } finally {
    clearTimeout(timeoutId)
  }
}

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T = void>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'DELETE' }),
}
