import { Subscription, SubscriptionResponses } from "@/types/subsction";
import { apiSlice } from "../api/apiSlice";

// Define TypeScript interfaces

interface CreateSubscriptionRequest {
  plan: string;
  paymentMethod: string;
  paymentReference: string;
}

interface RenewSubscriptionRequest {
  paymentMethod?: string;
  paymentReference?: string;
}

interface UpdateSubscriptionRequest {
  plan?: string;
  status?: string;
  endDate?: number;
  autoRenew?: boolean;
  price?: number;
  paymentMethod?: string;
  paymentReference?: string;
  minutesUsed?: number;
  renewalReminderSent?: boolean;
}

interface SubscriptionResponse {
  data: Subscription[];
}



export const subscriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // User subscription endpoints
    getSubscriptions: builder.query<SubscriptionResponse, void>({
      query: () => "/subscription/my-subscriptions",
    }),

    getSubscription: builder.query<Subscription, string>({
      query: (id) => `/subscription/my-subscriptions/${id}`,
      providesTags: (_, __, id) => [{ type: 'Subscription' as const, id }]
    }),

    createSubscription: builder.mutation<Subscription, CreateSubscriptionRequest>({
      query: (subscriptionData) => ({
        url: '/subscription',
        method: 'POST',
        body: subscriptionData
      }),
      invalidatesTags: [{ type: 'Subscription', id: 'LIST' }]
    }),

    renewSubscription: builder.mutation<Subscription, { id: string, data: RenewSubscriptionRequest }>({
      query: ({ id, data }) => ({
        url: `/subscription/renew/${id}`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' }
      ]
    }),

    cancelSubscription: builder.mutation<Subscription, string>({
      query: (id) => ({
        url: `/subscription/cancel/${id}`,
        method: 'POST'
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' }
      ]
    }),

    toggleAutoRenew: builder.mutation<Subscription, string>({
      query: (id) => ({
        url: `/subscription/auto-renew/${id}`,
        method: 'PATCH'
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Subscription', id }]
    }),

    getSubscriptionById: builder.query<SubscriptionResponses, string>({
      query: (id) => `/subscription/${id}`,
      providesTags: (_, __, id) => [{ type: 'AdminSubscription' as const, id }]
    }),

    getUserSubscriptionsById: builder.query<Subscription[], string>({
      query: (userId) => `/subscription/user/${userId}`,
      providesTags: (result, _, userId) =>
        result
          ? [
            ...result.map(({ _id }) => ({ type: 'AdminSubscription' as const, id: _id })),
            { type: 'AdminSubscription' as const, id: `USER_${userId}` }
          ]
          : [{ type: 'AdminSubscription' as const, id: `USER_${userId}` }]
    }),

    updateSubscription: builder.mutation<Subscription, { id: string, data: UpdateSubscriptionRequest }>({
      query: ({ id, data }) => ({
        url: `/subscription/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'AdminSubscription', id },
        { type: 'AdminSubscription', id: 'LIST' }
      ]
    }),

    // deleteSubscription: builder.mutation<void, string>({
    //   query: (id) => ({
    //     url: `/subscription/${id}`,
    //     method: 'DELETE'
    //   }),
    //   invalidatesTags: (_, __, id) => [
    //     { type: 'AdminSubscription', id },
    //     { type: 'AdminSubscription', id: 'LIST' }
    //   ]
    // })
  })
});

// Export hooks for usage in components
export const {
  // User subscription hooks
  useGetSubscriptionsQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useRenewSubscriptionMutation,
  useCancelSubscriptionMutation,
  useToggleAutoRenewMutation,

  // Admin subscription hooks
  // useGetAllSubscriptionsQuery,
  useGetSubscriptionByIdQuery,
  useGetUserSubscriptionsByIdQuery,
  useUpdateSubscriptionMutation,
  // useDeleteSubscriptionMutation
} = subscriptionApi;