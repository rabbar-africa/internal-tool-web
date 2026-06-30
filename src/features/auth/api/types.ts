export interface LoginCredentials {
  email: string;
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
