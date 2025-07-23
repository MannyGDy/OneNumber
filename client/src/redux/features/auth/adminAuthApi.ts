import { User } from "@/types/unified";
import { apiSlice } from "../api/apiSlice";
import { loggedIn, loggedOut } from "./authSlice";

// Types for request and response bodies
interface AdminRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AdminRegistrationResponse {
  activationToken: string;
  user: User; // Replace with actual user type
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: User; // Replace with actual user type
}

interface PasswordResetData {
  token: string;
  password: string;
  confirmPassword: string;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Registration Endpoints
    adminRegister: builder.mutation<AdminRegistrationResponse, AdminRegistrationData>({
      query: (data) => ({
        url: "admin/register",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    adminActivation: builder.mutation<User, { activation_token: string; activation_code: string }>({
      query: ({ activation_token, activation_code }) => ({
        url: "activate-user",
        method: "POST",
        body: { activation_token, activation_code },
      }),
    }),

    // Authentication Endpoints
    adminLogin: builder.mutation<LoginResponse, LoginData>({
      query: ({ email, password }) => ({
        url: "admin/login",
        method: "POST",
        body: { email, password },
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            loggedIn({
              accessToken: result.data.accessToken,
              user: result.data.user,
            })
          );
        } catch (error) {
          console.error("Login Error:", error);
        }
      },
    }),

    adminLogout: builder.mutation<void, void>({
      query: () => ({
        url: "admin/logout",
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(loggedOut());
        } catch (error) {
          console.error("Logout error:", error);
        }
      },
    }),

    // Password Management Endpoints
    adminForgotPassword: builder.mutation<void, { email: string }>({
      query: ({ email }) => ({
        url: "admin/forgotPassword",
        method: "POST",
        body: { email },
      }),
    }),

    adminResetPassword: builder.mutation<void, PasswordResetData>({
      query: ({ token, password,
        confirmPassword }) => ({
          url: `admin/resetPassword/${token}`,
          method: "PATCH",
          body: {
            password,
            confirmPassword
          },
        }),
    }),

    adminUpdatePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: ({ currentPassword, newPassword }) => ({
        url: "admin/updateMyPassword",
        method: "PATCH",
        body: { currentPassword, newPassword },
        credentials: "include",
      }),
    }),

    // Profile Management Endpoints
    updateProfile: builder.mutation<User, UpdateProfileData>({
      query: (data) => ({
        url: "admin/updateMe",
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
    }),

    deleteProfile: builder.mutation<void, void>({
      query: () => ({
        url: "admin/deleteMe",
        method: "DELETE",
        credentials: "include",
      }),
    }),

    // Admin Management Endpoints (for superadmin)
    getAllAdmins: builder.query<User[], void>({
      query: () => "admin",
      providesTags: ['Admins'],
    }),

    // getAdmin: builder.query<User, string>({
    //   query: (id) => `admin/${id}`,
    //   providesTags: (result, error, id) => [{ type: 'Admin', id }],
    // }),

    // toggleAdminStatus: builder.mutation<void, string>({
    //   query: (id) => ({
    //     url: `admin/${id}/toggleStatus`,
    //     method: "PATCH",
    //   }),
    //   invalidatesTags: (result, error, id) => [
    //     { type: 'Admin', id },
    //     'Admins'
    //   ],
    // }),

    refreshAccessToken: builder.mutation<{ accessToken: string }, void>({
      query: () => ({
        url: "admin/refreshToken",
        method: "POST",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  // Registration Hooks
  useAdminRegisterMutation,
  useAdminActivationMutation,

  // Authentication Hooks
  useAdminLoginMutation,
  useAdminLogoutMutation,

  // Password Management Hooks
  useAdminForgotPasswordMutation,
  useAdminResetPasswordMutation,
  useAdminUpdatePasswordMutation,

  // Profile Management Hooks
  useUpdateProfileMutation,
  useDeleteProfileMutation,

  // Admin Management Hooks
  useGetAllAdminsQuery,
  // useGetAdminQuery,
  // useToggleAdminStatusMutation,
  useRefreshAccessTokenMutation,
} = adminApi;