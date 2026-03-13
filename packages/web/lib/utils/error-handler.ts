import type { AxiosError } from 'axios'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export function parseApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as
      | { errors?: Array<{ message: string; code?: string }> }
      | undefined
    const message =
      data?.errors?.[0]?.message ?? error.message ?? '알 수 없는 오류'
    const code = data?.errors?.[0]?.code
    return { message, code, status }
  }
  if (error instanceof Error) return { message: error.message }
  return { message: '알 수 없는 오류가 발생했습니다.' }
}

function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error
}

export function getErrorMessage(error: unknown): string {
  return parseApiError(error).message
}
