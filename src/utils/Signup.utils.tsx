export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string, minLength: number = 3, maxLength: number = 20): boolean => {
  return username.length >= minLength && username.length <= maxLength;
};

export const validatePassword = (password: string, minLength: number = 6): boolean => {
  return password.length >= minLength;
};

export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

export const trimString = (str: string): string => {
  return str.trim();
};

export const isEmptyField = (value: string): boolean => {
  return trimString(value).length === 0;
};

export const sanitizeEmail = (email: string): string => {
  return trimString(email).toLowerCase();
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};
