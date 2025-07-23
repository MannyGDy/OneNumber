import express from "express";
import {
  // User subscription controllers
  createSubscription,
  getUserSubscriptions,
  getUserSubscription,
  renewSubscription,
  cancelSubscription,
  toggleAutoRenew,

  // Admin subscription controllers
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  getUserSubscriptionsById
} from "../controllers/subscription.controller";
import { isAuthenticated, authorizeRoles, updateAccessToken } from '../middleware/auth';

const subscriptionRoutes = express.Router();

subscriptionRoutes.use(updateAccessToken, isAuthenticated);

// User routes (require authentication)
subscriptionRoutes.post("/", createSubscription);
subscriptionRoutes.get("/my-subscriptions", getUserSubscriptions);
subscriptionRoutes.get("/my-subscriptions/:id", getUserSubscription);
subscriptionRoutes.post("/renew/:id", renewSubscription);
subscriptionRoutes.post("/cancel/:id", cancelSubscription);
subscriptionRoutes.patch("/auto-renew/:id", toggleAutoRenew);

// Admin routes (require admin role)
subscriptionRoutes.get("/get-all", isAuthenticated, authorizeRoles("admin"), getAllSubscriptions);
subscriptionRoutes.get("/:id", isAuthenticated, authorizeRoles("admin"), getSubscriptionById);
subscriptionRoutes.patch("/:id", isAuthenticated, authorizeRoles("admin"), updateSubscription);
subscriptionRoutes.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteSubscription);
subscriptionRoutes.get("/user/:userId", isAuthenticated, authorizeRoles("admin"), getUserSubscriptionsById);

export default subscriptionRoutes;