import { PaymentVerificationResponse } from "@/types/payment";
import { apiSlice } from "../api/apiSlice";

interface Payment {

  planType: string;
  description: string;
}

interface PaymentResponse {
  data: {
    authorization_url: string;
  };
}


export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation<PaymentResponse, Payment>({
      query: (payment) => ({
        url: "/payment/create-payment-link",
        method: "POST",
        body: {
          planType: payment.planType,
          description: payment.description,
        },
      })
    }),
    verifyPayment: builder.query<PaymentVerificationResponse, string>({
      query: (referenceId) => ({
        url: `/payment/verify-payment/${referenceId}`,
        method: "GET",
      }),
    }),
    handleSuccessfulPayment: builder.mutation<Payment, { referenceId: string, phoneNumberId: string }>({
      query: ({ referenceId, phoneNumberId }) => ({
        url: `/payment/success/${referenceId}`,
        method: "POST",
        body: { numberId: phoneNumberId },
      }),
    }),
    handleCancelledPayment: builder.query<Payment, string>({
      query: (referenceId) => ({
        url: `/payment/cancel/${referenceId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useCreatePaymentMutation, useVerifyPaymentQuery, useHandleSuccessfulPaymentMutation, useHandleCancelledPaymentQuery } = paymentApi;