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

// ── Settings (Theme Customizer) Endpoints ────────────────────────────────────

export const settingsApi = {
  get: () =>
    request<Record<string, unknown>>('/auth/settings/', { method: 'GET' }),

  save: (data: Record<string, unknown>) =>
    request<Record<string, unknown>>('/auth/settings/', {
      method: 'PUT',
      body: { data },
    }),
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export const statsApi = {
  me: () => request<Record<string, unknown>>('/auth/me/stats/', { method: 'GET' }),
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export interface BookingListItem {
  id: string
  reference: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total: string
  created_at: string
  tour?: { id: string; title: string }
  guest_name: string
  booking_date: string
  participants: number
}

export const bookingsApi = {
  list: (params?: { status?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.page) qs.set('page', String(params.page))
    return request<{ count: number; results: BookingListItem[] }>(`/bookings/?${qs}`, { method: 'GET' })
  },

  get: (id: string) =>
    request<BookingListItem>(`/bookings/${id}/`, { method: 'GET' }),

  cancel: (id: string) =>
    request<BookingListItem>(`/bookings/${id}/cancel/`, { method: 'POST' }),

  // Vendor actions
  confirm: (id: string) =>
    request<BookingListItem>(`/bookings/${id}/confirm/`, { method: 'POST' }),

  pending: () =>
    request<BookingListItem[]>('/bookings/pending_bookings/', { method: 'GET' }),
}

// ── Organizations ─────────────────────────────────────────────────────────────

export interface OrgData {
  id: string
  slug: string
  name: string
  org_type: string
  status: string
  business_email: string
  business_phone: string
  address: string
  city: string
  created_at: string
}

export const organizationsApi = {
  mine: () =>
    request<OrgData[]>('/organizations/mine/', { method: 'GET' }),

  get: (id: string) =>
    request<OrgData>(`/organizations/${id}/`, { method: 'GET' }),

  create: (data: Partial<OrgData>) =>
    request<OrgData>('/organizations/', {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),

  update: (id: string, data: Partial<OrgData>) =>
    request<OrgData>(`/organizations/${id}/`, {
      method: 'PATCH',
      body: data as unknown as Record<string, unknown>,
    }),

  members: (orgId: string) =>
    request<unknown[]>(`/organizations/${orgId}/members/`, { method: 'GET' }),

  invite: (orgId: string, data: { email: string; role: string }) =>
    request<{ detail: string }>(`/organizations/${orgId}/members/invite/`, {
      method: 'POST',
      body: data as unknown as Record<string, unknown>,
    }),
}

// ── Inventory (Vendor Listings) ───────────────────────────────────────────────

export const inventoryApi = {
  hotels: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params)
    return request<{ count: number; results: unknown[] }>(`/hotels/?${qs}`, { method: 'GET' })
  },
  tours: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params)
    return request<{ count: number; results: unknown[] }>(`/tours/?${qs}`, { method: 'GET' })
  },
  attractions: (params?: Record<string, string>) => {
    const qs = new URLSearchParams(params)
    return request<{ count: number; results: unknown[] }>(`/attractions/?${qs}`, { method: 'GET' })
  },
  
  // ── Vendor / Partner Management ─────────────────────────────────────────────
  
  vendorHotels: () => request<unknown[]>('/inventory/vendor/hotels/'),
  vendorTours: () => request<unknown[]>('/inventory/vendor/tours/'),

  createHotel: (data: any) => 
    request<any>('/inventory/vendor/hotels/', { method: 'POST', body: data }),
  
  createTour: (data: any) => 
    request<any>('/inventory/vendor/tours/', { method: 'POST', body: data }),

  createAttraction: (data: any) => 
    request<any>('/inventory/vendor/attractions/', { method: 'POST', body: data }),

  createRestaurant: (data: any) => 
    request<any>('/inventory/vendor/restaurants/', { method: 'POST', body: data }),

  createTransfer: (data: any) => 
    request<any>('/inventory/vendor/transfers/', { method: 'POST', body: data }),

  createRoomType: (data: any) => 
    request<any>('/inventory/vendor/rooms/', { method: 'POST', body: data }),
  
  createTourSlot: (data: any) => 
    request<any>('/inventory/vendor/slots/', { method: 'POST', body: data }),
}

// ── Deals (Public + Admin) ────────────────────────────────────────────────────

export interface ApiDealFull {
  id: string
  title: string
  description: string
  image: string
  original_price: string
  sale_price: string
  discount_pct: number
  listing_type: string
  badge: string
  badge_display: string
  location: string
  expires_at: string
  is_active: boolean
  is_live: boolean
  priority: number
}

export const dealsApi = {
  list: (params?: { active?: boolean; limit?: number; listing_type?: string }) => {
    const qs = new URLSearchParams()
    if (params?.active !== undefined) qs.set('active', params.active ? 'true' : 'false')
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.listing_type) qs.set('listing_type', params.listing_type)
    return request<ApiDealFull[]>(`/deals/?${qs}`, { method: 'GET' })
  },

  get: (id: string) =>
    request<ApiDealFull>(`/deals/${id}/`, { method: 'GET' }),
}

// ── CMS / Destinations ────────────────────────────────────────────────────────

export const cmsApi = {
  destinations: () =>
    request<unknown[]>('/destinations/', { method: 'GET' }),

  destination: (id: string) =>
    request<unknown>(`/destinations/${id}/`, { method: 'GET' }),
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  // User management
  users: (params?: { search?: string; role?: string }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.role) qs.set('role', params.role)
    return request<User[]>(`/auth/admin/users/?${qs}`, { method: 'GET' })
  },

  updateUser: (id: string, data: Record<string, unknown>) =>
    request<User>(`/auth/admin/users/${id}/`, {
      method: 'PATCH',
      body: data,
    }),

  // Organization management
  organizations: (params?: { status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    return request<OrgData[]>(`/organizations/admin/?${qs}`, { method: 'GET' })
  },

  approveOrg: (id: string) =>
    request<OrgData>(`/organizations/admin/${id}/approve/`, { method: 'POST' }),

  suspendOrg: (id: string) =>
    request<OrgData>(`/organizations/admin/${id}/suspend/`, { method: 'POST' }),

  rejectOrg: (id: string, reason: string) =>
    request<OrgData>(`/organizations/admin/${id}/reject/`, {
      method: 'POST',
      body: { reason } as unknown as Record<string, unknown>,
    }),
}

// ── Payments (ABA PayWay) ─────────────────────────────────────────────────────

export interface PayWayPayload {
  req_time: string
  merchant_id: string
  tran_id: string
  amount: string
  items: string
  currency: string
  return_url: string
  hash: string
  aba_url: string
}

export const paymentsApi = {
  getPaywayPayload: (bookingId: string) =>
    request<PayWayPayload>('/payments/payway/checkout-payload/', {
      method: 'POST',
      body: { booking_id: bookingId },
    }),

  checkStatus: (tranId: string) =>
    request<{ status: string; booking_status: string; reference: string }>(`/payments/payway/check-status/${tranId}/`, {
      method: 'GET',
    }),
}

export default request
