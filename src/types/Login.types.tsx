export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  userId: string;
}

export interface LoginViewModelState {
  email: string;
  password: string;
  loading: boolean;
  showPassword: boolean;
}
