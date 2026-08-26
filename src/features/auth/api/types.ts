export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  /** The 6-digit OTP emailed to the user. */
  otp: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  organizationId?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterPayload {
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  website?: string;
  taxId?: string;
  timezone?: string;
  currency?: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerPhone?: string;
}

export type RegisterResponse = LoginResponse;

export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "EXPIRED"
  | "INACTIVE";

export interface SubscriptionPlan {
  id: string;
  tier: string;
  name: string;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  expiresAt: string;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
}

/** What `GET /auth/invites/:token` returns for the accept page to render. */
export interface InviteDetails {
  email: string;
  organizationName: string;
  /** Role names the invitee will hold once they accept. */
  roles: string[];
  expiresAt: string;
}

export interface AcceptInvitePayload {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber?: string;
}
