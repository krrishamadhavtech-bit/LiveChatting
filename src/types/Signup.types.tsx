export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupResponse {
  username: string;
  userId: string;
}

export interface SignupViewModelState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
}
