import { PhoneNumber } from "@/types/unified";
import { apiSlice } from "../api/apiSlice";



interface PhoneNumberStats {
  total: number;
  available: number;
  taken: number;
  reserved: number;
}

interface PhoneNumberResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: PhoneNumber[];
}


export const phoneApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all phone numbers (admin only)
    getPhoneNumbers: builder.query<PhoneNumberResponse, void>({
      query: () => "/phone-number",
      providesTags: ["PhoneNumbers"]
    }),

    // Get available phone numbers
    getAvailablePhoneNumbers: builder.query<PhoneNumberResponse, void>({
      query: () => "/phone-number/available",
      providesTags: ["PhoneNumbers"]
    }),

    // Get taken phone numbers (admin only)
    getTakenPhoneNumbers: builder.query<PhoneNumber[], void>({
      query: () => "/phone-number/taken",
      providesTags: ["PhoneNumbers"]
    }),

    // Get phone number stats (admin only)
    getPhoneNumberStats: builder.query<PhoneNumberStats, void>({
      query: () => "/phone-number/stats",
      providesTags: ["PhoneNumbers"]
    }),

    // Get a single phone number by ID
    getPhoneNumber: builder.query<PhoneNumber, string>({
      query: (id) => `/phone-number/${id}`,
      providesTags: (result, error, id) => [{ type: "PhoneNumbers", id }]
    }),

    // Add a new phone number (admin only)
    addPhoneNumber: builder.mutation<PhoneNumber, { phoneNumber: string;  }>({
      query: (data) => ({
        url: "/phone-number/add",
        method: "POST",
        body: data  // Send the entire data object directly
      }),
      invalidatesTags: ["PhoneNumbers"]
    }),

    // Upload phone numbers via CSV (admin only)
    uploadPhoneNumbers: builder.mutation<{ success: boolean; count: number }, FormData>({
      query: (data) => ({
        url: "/phone-number/upload",
        method: "POST",
        body: data,
        formData: true
      }),
      invalidatesTags: ["PhoneNumbers"]
    }),

    // Update phone number status (admin only)
    updatePhoneNumberStatus: builder.mutation<PhoneNumber, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/phone-number/${id}/status`,
        method: "PUT",
        body: { status }
      }),
      invalidatesTags: (result, error, { id }) => [
        "PhoneNumbers",
        { type: "PhoneNumbers", id }
      ]
    }),

    // Reserve a phone number
    reservePhoneNumber: builder.mutation<PhoneNumber, string>({
      query: (id) => ({
        url: `/phone-number/${id}/reserve`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        "PhoneNumbers",
        { type: "PhoneNumbers", id }
      ]
    }),

    // Delete a phone number (admin only)
    deletePhoneNumber: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/phone-number/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["PhoneNumbers"]
    })
  })
});

export const {
  useGetPhoneNumbersQuery,
  useGetAvailablePhoneNumbersQuery,
  useGetTakenPhoneNumbersQuery,
  useGetPhoneNumberStatsQuery,
  useGetPhoneNumberQuery,
  useAddPhoneNumberMutation,
  useUploadPhoneNumbersMutation,
  useUpdatePhoneNumberStatusMutation,
  useReservePhoneNumberMutation,
  useDeletePhoneNumberMutation
} = phoneApi;