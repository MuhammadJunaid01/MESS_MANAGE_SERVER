import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { catchAsync } from "..";
import config from "../../config";
import { AuthUser } from "../../interfaces";
import { UserRole } from "../../modules/User/user.interface";
import { AppError } from "../errors";

// JWT authentication middleware
export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearers", "");

    if (!token) {
      throw new AppError("No token provided", 401, "UNAUTHORIZED");
    }

    try {
      const decoded = jwt.verify(
        token,
        config.secretToken || "secret"
      ) as AuthUser;
      req.user = decoded; // Set user data from JWT payload
      next();
    } catch (err) {
      throw new AppError("Invalid token", 401, "INVALID_TOKEN");
    }
  }
);

// Role-based authorization middleware
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action",
        403,
        "FORBIDDEN"
      );
    }
    next();
  };
};
