import type { User, LoginResponse, RegisterResponse } from '@/types/authTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | FormData
}

// Mutex for token refresh — prevents multiple concurrent 401s from each triggering a refresh
let refreshPromise: Promise<boolean> | null = null

/**
 * Lightweight fetch wrapper for the Django backend.
 *
 * - Automatically adds JSON Content-Type for non-FormData payloads.
 * - Sends cookies (HttpOnly refresh token, CSRF) with every request.
 * - Attaches the access token from localStorage when available.
 * - Automatically refreshes the access token on 401 and retries once.
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  }

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const isFormData = body instanceof FormData

  if (!isFormData && body) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers,
    credentials: 'include', // send HttpOnly cookies (refresh token + CSRF)
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })

  // On 401, try refreshing the access token once (shared mutex)
  if (response.status === 401 && accessToken) {
    const refreshed = await (refreshPromise ??= refreshAccessToken().finally(() => { refreshPromise = null }))

    if (refreshed) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`

      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...rest,
        headers,
        credentials: 'include',
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      })

      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => ({}))
        throw new ApiError(retryResponse.status, error)
      }

      return retryResponse.json() as Promise<T>
    } else {
      // Refresh failed → clear tokens and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }

      throw new ApiError(401, { detail: 'Session expired. Please log in again.' })
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(response.status, error)
  }

  // 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

/**
 * Attempt to get a new access token using the HttpOnly refresh cookie.
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    if (!response.ok) return false

    const data = await response.json()

    if (data.access) {
      localStorage.setItem('access_token', data.access)

      return true
    }

    return false
  } catch {
    return false
  }
}

export class ApiError extends Error {
  status: number
  data: Record<string, unknown>

  constructor(status: number, data: Record<string, unknown>) {
    const message =
      (data?.detail as string) ??
      (data?.non_field_errors as string[])?.join(', ') ??
      'An error occurred'

    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// ── Auth Endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  login: (data: { email: string; password: string }) =>
    request<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),

  register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    request<RegisterResponse>('/auth/register/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),

  logout: () =>
    request<{ detail: string }>('/auth/logout/', { method: 'POST' }),

  me: () =>
    request<User>('/auth/me/', { method: 'GET' }),

  updateProfile: (data: { full_name?: string; phone?: string }) =>
    request<User>('/auth/me/', {
      method: 'PATCH',
      body: data as unknown as Record<string, unknown>,
    }),

  verifyEmail: (token: string) =>
    request<{ detail: string; access: string; refresh: string }>('/auth/email/verify/', {
      method: 'POST',
      body: { token } as unknown as Record<string, unknown>,
    }),

  resendVerification: () =>
    request<{ detail: string }>('/auth/email/resend-verification/', { method: 'POST' }),

  requestPasswordReset: (email: string) =>
    request<{ detail: string }>('/auth/password/reset/request/', {
      method: 'POST',
      body: { email } as unknown as Record<string, unknown>,
    }),

  confirmPasswordReset: (data: { token: string; new_password: string }) =>
    request<{ detail: string }>('/auth/password/reset/confirm/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),

  changePassword: (data: { current_password: string; new_password: string }) =>
    request<{ detail: string }>('/auth/password/change/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),
}

export default request
