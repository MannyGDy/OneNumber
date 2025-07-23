import express, { NextFunction } from "express";
import { isAuthenticated, updateAccessToken } from "../middleware/auth";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import { getUserProfile } from "../controllers/user.controller";
import { getAdminProfile } from "../controllers/admin.controller";

const unifiedRouter = express.Router();

interface Request extends express.Request {
  user?: any;
}
const handleRoleBasedRoute = (controllers: any) => {
  return CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {

    if (!req.user || !req.user.role) {
      console.error("User role not found", req.user);
      throw new ErrorHandler("User role is not defined", 400);
    }

    const controller = controllers[req.user.role];
    if (!controller) {
      console.error("No handler found for role:", req.user.role);
      throw new ErrorHandler(`No handler found for role: ${req.user.role}`, 400);
    }

    await controller(req, res, next);
  });
};

unifiedRouter.get("/refresh", updateAccessToken, handleRoleBasedRoute({
  admin: getAdminProfile,
  user: getUserProfile,
}));



unifiedRouter.get(
  "/profile",
  updateAccessToken,
  isAuthenticated,
  handleRoleBasedRoute({
    admin: getAdminProfile,
    user: getUserProfile,
  })
);
export default unifiedRouter;

