export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'user' | 'admin';
  createdAt: string;

}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

