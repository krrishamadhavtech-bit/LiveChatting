export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string, minLength: number = 6): boolean => {
  return password.length >= minLength;
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
