import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import { AppDispatch } from "../../store";
import { User } from "@/types/unified";


interface AuthState {
  user: User | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
};

interface AuthPayload {
  token: string;
  user: User;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    registration: (state, action: PayloadAction<AuthPayload>) => {
      state.accessToken = action.payload.token;
      state.user = action.payload.user;
    },
    loggedIn: (state, action) => {
      state.accessToken = action.payload.accessToken;
      // Make sure we update the entire user object
      state.user = action.payload.user;
    },
    loggedOut: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

// ✅ Logout action with API cache reset
export const logoutUser = () => (dispatch: AppDispatch) => {
  dispatch(loggedOut());
  dispatch(apiSlice.util.resetApiState()); // Clears API cache on logout
};

export const { loggedIn, loggedOut, registration } = authSlice.actions;
export default authSlice.reducer;
