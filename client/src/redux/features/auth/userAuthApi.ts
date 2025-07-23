
import { apiSlice } from "../api/apiSlice";
import { loggedIn, loggedOut } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data) => ({
        url: "user/register", // Ensure this matches your backend API
        method: "POST",
        body: {
          firstName: data.firstName, // Replace keys with backend-expected field names
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        },
        credentials: "include",
      }),

    }),

    login: builder.mutation({
      query: ({ email, password }) => ({
        url: "user/login",
        method: "POST",
        body: {
          email,
          password,
        },
        credentials: "include" as const,
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
        } catch (error: unknown) {
          console.error("Login Error:", error);
        }
      },
    }),
    logOut: builder.mutation({
      query: () => ({
        url: "user/logout",
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(loggedOut());
        } catch (error: unknown) {
          console.error("Logout error: ", error);
        }
      },
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "user/password/forgot",
        method: "POST",
        body: email,
        credentials: "include",
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password, confirmPassword }) => ({
        url: `/user/password/reset/${token}`,
        method: "PATCH",
        body: {
          password,
          confirmPassword
        },
        credentials: "include",
      }),
    }),
    // New endpoints for email verification
    verifyEmail: builder.mutation({
      query: ({ userId, verificationCode }) => ({
        url: `user/verify-email/${userId}`,
        method: "POST",
        credentials: "include",
        body: { code: verificationCode },
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;


          // Check if the data exists and has the expected properties
          if (result.data) {

            if (result.data.accessToken && result.data.user) {
              dispatch(
                loggedIn({
                  accessToken: result.data.accessToken,
                  user: result.data.user,
                })
              );
            } else {
              console.error("Missing token or user data in response data:", result.data);
            }
          } else {
            console.error("No data in response:", result);
          }
        } catch (error) {
          console.error("Error occurred during verification:", error);
          // Log the error details
          if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }
        }
      },
    }),
    requestEmailVerification: builder.mutation({
      query: ({ userId }) => ({
        url: "user/request-verification",
        method: "POST",
        body: { userId },
        credentials: "include",
      }),
    }),
    updatePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: ({ currentPassword, newPassword }) => ({
        url: "user/update-password",
        method: "PATCH",
        body: { currentPassword, newPassword },
        credentials: "include",
      }),
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: "user/admin/users",
        method: "GET",
        credentials: "include",
      }),
    }),
    deleteUser: builder.mutation({
  query: (userId) => ({
    url: `user/admin/user/${userId}`,
    method: "DELETE",
    credentials: "include",
  }),
}),
    unassignPhoneNumber: builder.mutation({
      query: (userId) => ({
        url: `user/admin/unassign-phone/${userId}`,
        method: "PATCH",
        credentials: "include",
      }),
    }),
    getUserById: builder.query({
      query: (userId) => ({
        url: `user/admin/user/${userId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    activateUserAccount: builder.mutation({
      query: (userId) => ({
        url: `user/${userId}/active`,
        method: "PUT",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogOutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useRequestEmailVerificationMutation,
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUnassignPhoneNumberMutation,
  useGetUserByIdQuery,
  useUpdatePasswordMutation,
  useActivateUserAccountMutation,
} = authApi;