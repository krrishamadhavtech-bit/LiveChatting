import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  user: {
    uid: string;
    email: string;
    name?: string;
  } | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isLoggedIn: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.error = null;
      state.isLoading = false;
    },
    restoreSession: (state, action: PayloadAction<AuthState['user']>) => {
      if (action.payload) {
        state.user = action.payload;
        state.isLoggedIn = true;
      }
    },
  },
});

export const { setLoading, setUser, setError, logout, restoreSession } =
  authSlice.actions;
export default authSlice.reducer;
