import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../store";
import { loggedIn, loggedOut } from "../auth/authSlice";
import { Subscription } from "@/types/subsction";
import { setSubscriptions } from "../subscription/subscriptionSlice";
import { User } from "@/types/unified";

interface SubscriptionResponse {
  success: boolean;
  count: number;
  data: Subscription[];
}

interface UserResponse {
  success: boolean;
  user: User;
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth?.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth: typeof baseQuery = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  let result = await baseQuery(args, api, extraOptions);

  // Check if the request is to a user profile-related route
  const isProfileRoute =
    (typeof args === 'object' &&
      (args.url === '/profile' ||
        args.url === '/user/profile' ||
        args.url === 'user')) &&
    result.data;

  if (isProfileRoute) {
    // Ensure we always update the user state with the latest data
    const userResponse = result.data as UserResponse;
    api.dispatch(
      loggedIn({
        accessToken: state.auth.accessToken || null,
        user: userResponse.user,
      })
    );
  }

  if (result.error && result.error.status === 401) {
    // Token refresh logic
    const refreshResult = await baseQuery({ url: "refresh", method: "GET" }, api, extraOptions);

    if (refreshResult.data) {
      const refreshResponse = refreshResult.data as { accessToken: string; user: User };
      const accessToken = refreshResponse.accessToken;
      const user = refreshResponse.user;

      api.dispatch(
        loggedIn({
          accessToken,
          user,
        })
      );

      // Fetch fresh user data if not included in refresh response
      if (!user) {
        const userResult = await baseQuery({ url: "/profile", method: "GET" }, api, extraOptions);
        const userResponse = userResult.data as UserResponse;
        if (userResponse) {
          api.dispatch(
            loggedIn({
              accessToken,
              user: userResponse.user,
            })
          );
        }
      }

      // Retry the original request with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(loggedOut());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Subscription", "AdminSubscription", "PhoneNumbers", "User", "Notifications", "NotificationPreferences", "Admins"],
  endpoints: (builder) => ({
    refreshToken: builder.query<void, void>({
      query: () => "refresh",
    }),
    loadUser: builder.query<User, void>({
      query: () => "/profile",
      providesTags: ["User"],
      // Transform response to return only user object
      transformResponse: (response: UserResponse) => response.user,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            loggedIn({
              accessToken: null, // Preserve existing token
              user: data, // Directly pass the transformed user object
            })
          );
        } catch (error) {
          console.error("Failed to load user:", error);
        }
      },
    }),
    getAllSubscriptions: builder.query<Subscription[], void>({
      query: () => "/subscription/get-all",
      keepUnusedDataFor: 300, // 5 minutes cache
      providesTags: ["Subscription", "AdminSubscription"],
      // Add a transform to extract just the data array
      transformResponse: (response: SubscriptionResponse) => response.data,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setSubscriptions(data));
        } catch (error) {
          console.error("Subscription update failed:", error);
        }
      },
    }),
  }),
});

export const {
  useRefreshTokenQuery,
  useLoadUserQuery,
  useGetAllSubscriptionsQuery
} = apiSlice;