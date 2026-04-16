export interface OrgMembership {
  org_id: string
  org_slug: string
  org_name: string
  org_type: string
  role: string
}

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  avatar: string | null
  platform_role: string
  is_email_verified: boolean
  is_phone_verified: boolean
  google_linked: boolean
  facebook_linked: boolean
  date_joined: string
  org_memberships: OrgMembership[]
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface RegisterResponse {
  access: string
  refresh: string
  user: User
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  new_password: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}
