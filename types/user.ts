import type { Timestamps } from "./common"
import { ContactPreference, PublisherType, UserStatus } from "@/types/enums"

export interface RoleDto {
  id: number
  name: string
  guard_name?: string
  permissions?: PermissionDto[]
}

export interface PermissionDto {
  id: number
  name: string
  guard_name?: string
}

export interface UserDto extends Timestamps {
  id: number
  name: string
  email: string
  status?: UserStatus
  email_verified_at: string | null
  phone?: string | null
  avatar_url?: string | null
  publisher_type?: PublisherType | null
  is_verified?: boolean
  two_factor_enabled?: boolean
  website_url?: string | null
  description?: string | null
  social_links?: Record<string, string> | null
  contact_preference?: ContactPreference | null
  average_rating?: number | null
  reviews_count?: number
  employees_count?: number | null
  roles?: RoleDto[]
}

export interface AuthSessionDto {
  user: UserDto
  token: string
}

export type OtpDeliveryChannel = "email" | "sms" | "push"

export interface OtpLoginRequest {
  identifier: string
}

export interface OtpLoginResponse {
  message: string
  channel: OtpDeliveryChannel
  identifier: string
}

export interface OtpVerifyRequest {
  identifier: string
  code: string
}

export interface OtpVerifySuccessResponse {
  data: AuthSessionDto
}

export interface OtpVerifyTwoFactorRequiredResponse {
  message: string
  two_factor_required: true
  challenge_token: string
}

export type OtpVerifyResponse =
  | OtpVerifySuccessResponse
  | OtpVerifyTwoFactorRequiredResponse

export interface TwoFactorChallengeRequest {
  code?: string
  recovery_code?: string
}

export interface TwoFactorChallengeResponse {
  data: AuthSessionDto
}

export interface CurrentUserResponse {
  data: UserDto
}

export interface LogoutResponse {
  message: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export interface RegisterRequest {
  name: string
  email: string
  phone?: string
  password: string
  password_confirmation: string
}

export interface UpdateProfileRequest {
  name: string
  email: string
}

export interface UpdatePasswordRequest {
  current_password: string
  password: string
  password_confirmation: string
}

export interface UpdatePublisherProfileRequest {
  name?: string
  phone?: string
  website?: string
  description?: string
  social_links?: Record<string, string>
}
