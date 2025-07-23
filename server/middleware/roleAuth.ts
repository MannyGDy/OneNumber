import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { isAuthenticated } from "./auth";

type RoleHandler = {
  [key: string]: (req: Request, res: Response, next: NextFunction) => Promise<any>;
};

export const createRoleMiddleware = (roles: string[]) => {
  return CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      // First run the authentication check
      await isAuthenticated(req, res, async () => {
        // Then check role authorization
        if (!roles.includes(req.user?.role || "")) {
          return next(
            new ErrorHandler(
              `Role: ${req.user?.role} is not allowed to access this resource`,
              403
            )
          );
        }

        // Add role context to request
        req.userContext = {
          role: req.user?.role || "",
          isTeacher: req.user?.role === "teacher",
          isStudent: req.user?.role === "student",
          isAdmin: req.user?.role === "admin"
        };

        next();
      });
    }
  );
};
