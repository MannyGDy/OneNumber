require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { accessTokenOptions, refreshTokenOptions } from "../utils/jwt";
import rateLimit from 'express-rate-limit';
import Admin, { IAdmin } from "../models/admin.model";
import User, { IUser } from "../models/user.model";

// authenticated user
// Define interface for decoded token
interface IDecodedToken extends JwtPayload {
  id: string;
  role?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser | IAdmin;
    userType?: string;
  }
}


// middleware/auth.ts


export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access_token = req.cookies.access_token;


      if (!access_token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
      }

      const decoded = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN as string
      ) as JwtPayload;

      if (!decoded?.id) {
        return next(new ErrorHandler("Please login to access this resource", 401));
      }

      const user = await User.findById(decoded.id) || await Admin.findById(decoded.id);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      req.user = user;
      req.userType = user?.role as 'admin';

      next();
    } catch (error: any) {
      return next(new ErrorHandler("Authentication failed", 401));
    }
  }
);
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

interface IDecodedToken extends JwtPayload {
  id: string;
  role?: string;
}


export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get refresh token from cookies
      const refresh_token = req.cookies.refresh_token;
      if (!refresh_token) {
        return next(new ErrorHandler("Refresh token is required", 400));
      }

      // Verify refresh token
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as IDecodedToken;

      if (!decoded?.id) {
        return next(new ErrorHandler("Invalid refresh token", 400));
      }

      const user = await User.findById(decoded.id) || await Admin.findById(decoded.id);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Create new tokens
      const accessToken = jwt.sign(
        {
          id: user._id,
          role: user.role
        },
        process.env.ACCESS_TOKEN as string,
        {
          expiresIn: "1d",
        }
      );

      const refreshToken = jwt.sign(
        {
          id: user._id,
          role: user.role
        },
        process.env.REFRESH_TOKEN as string,
        {
          expiresIn: "3d",
        }
      );

      // Attach user to request
      req.user = user;

      // Set new cookies
      res.cookie("access_token", accessToken, {
        ...accessTokenOptions,
        maxAge: 159200000, //  
      });

      res.cookie("refresh_token", refreshToken, {
        ...refreshTokenOptions,
        maxAge: 459200000, // 5 days
      });

      next();
    } catch (error: any) {
      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        return next(new ErrorHandler("Invalid token", 401));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new ErrorHandler("Token has expired", 401));
      }
      return next(new ErrorHandler(error.message || "Token refresh failed", 400));
    }
  }
);


// Rate limiting middleware (add to sensitive routes)

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    status: 429,
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password strength validation
export const validatePasswordStrength = (password: string): boolean => {
  // Password must be at least 8 characters with a mix of letters, numbers, and special characters
  const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

