require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import fs from "fs";
import { mkdir } from "fs/promises";
import path from "path";

// Import custom middlewares and routes
import { ErrorMiddleware } from "./middleware/error";
import { updateAccessToken } from "./middleware/auth";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";
import phoneNumberRoutes from "./routes/phoneNumber.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import unifiedRouter from "./routes/unified.routes";
import paymentRouter from "./routes/payment.routes";
import notificationRouter from "./routes/notification.routes";
import { NODE_ENV, COOKIE_SECRET, FRONTEND_URL } from "./config/env";
import subscriptionSchedulerService from "./services/subscription.scheduler.service";
import mongoose from "mongoose";


export const app = express();

// =======================
// Security & Performance Middlewares
// =======================

// Global rate limiter applied to all requests
export const userRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // More reasonable limit for authenticated users
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this user, please try again after 5 minutes",
  // Custom key generator that uses user ID instead of IP
  keyGenerator: (req: Request) => {
    // If user is authenticated, use their ID
    if (req.user && req.user.id) {
      return req.user.id;
    }
    // Fall back to IP address for non-authenticated requests
    return req.ip;
  },
  // Optional: Different limits for authenticated vs non-authenticated
  skip: (req: Request) => {
    // Skip rate limiting for specific routes if needed
    // For example, maybe don't rate limit the login endpoint
    if (req.path === '/api/v1/user/login' || req.path === '/api/v1/user/register') {
      return true;
    }
    return false;
  }
}); // This activates the rate limiter

// Set various security HTTP headers
app.use(helmet());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compression middleware to reduce response size and improve speed
app.use(compression());

app.use(userRateLimiter);

// =======================
// Request Parsing & Logging
// =======================

// Use a single JSON body parser with an appropriate size limit
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Secure cookie parser using a secret
app.use(cookieParser(COOKIE_SECRET));

// Custom security headers (extra layer of defense)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});


// Initialize subscription scheduler
subscriptionSchedulerService.initialize();

// Run an immediate check for expired subscriptions (optional)
subscriptionSchedulerService.runExpiredSubscriptionsCheck();

// HTTP request logging in development mode
if (NODE_ENV === "development") {
  app.use(
    morgan((tokens, req, res) =>
      [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms"
      ].join(" ")
    )
  );
}

// =======================
// CORS Configuration
// =======================
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// =======================
// Static Files & Uploads
// =======================
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  mkdir(uploadsDir, { recursive: true }).catch(console.error);
}

// =======================
// API Routes
// =======================
app.use("/api/v1", unifiedRouter);
app.use("/api/v1/notification", updateAccessToken, notificationRouter);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/phone-number", phoneNumberRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/payment", paymentRouter);

// Testing endpoint
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    msg: "API is working"
  });
});

// =======================
// Error Handling
// =======================

// Handle undefined routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function shutdown() {
  console.log("Shutting down...");
  await mongoose.connection.close();
  process.exit(0);
}

// Centralized error middleware
app.use(ErrorMiddleware);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message
  });
});
