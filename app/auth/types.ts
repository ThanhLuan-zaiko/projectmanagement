export type AuthMode = 'login' | 'register';

export interface FormData {
  email: string;
  username: string;
  password: string;
  full_name: string;
  phone: string;
}

export interface FormErrors {
  email?: string;
  username?: string;
  password?: string;
  full_name?: string;
}
