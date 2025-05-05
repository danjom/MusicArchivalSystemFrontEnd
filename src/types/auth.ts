export interface UserData {
  email: string;
  id: number;
  created_at: string;
  updated_at: string | null;
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  scopes: string[];
}

export interface RefreshTokenRequest {
  refresh_token: string;
}