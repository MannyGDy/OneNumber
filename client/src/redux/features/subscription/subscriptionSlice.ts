// features/subscription/subscriptionSlice.ts
import { Subscription } from "@/types/subsction";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";



interface SubscriptionState {
  subscriptions: Subscription[];
}

const initialState: SubscriptionState = {
  subscriptions: [],
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.subscriptions = action.payload;
    },
  },
});

export const { setSubscriptions } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;