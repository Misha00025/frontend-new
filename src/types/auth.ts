export interface LoginData {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    token: string;
  }
  
  export interface RefreshResponse {
    accessToken: string;
  }