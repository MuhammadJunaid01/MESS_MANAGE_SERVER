import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { catchAsync } from "..";
import config from "../../config";
import { AuthUser } from "../../interfaces/global.interface";
import { UserRole } from "../../modules/User/user.interface";
import UserModel from "../../modules/User/user.model";
import { AppError } from "../errors";

// JWT authentication middleware
export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract the token from the Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No or invalid token provided", 401, "UNAUTHORIZED");
    }
    console.log("HIT PROTECT");
    const token = authHeader.replace("Bearer ", ""); // Correctly replace "Bearer " prefix
    if (!token) {
      throw new AppError("No token provided", 401, "UNAUTHORIZED");
    }

    try {
      // Verify the token using the secret key
      const decoded = jwt.verify(
        token,
        config.secretToken || "secret" // Use secret from config or fallback to "secret"
      ) as AuthUser;
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
      }
      // if (user.role === UserRole.Admin);
      if (user.messId && user._id) {
        console.log(
          "USER MESS ID FROMhgjhgjhgjhgjghjhgjghjhgjhg  PROTEXYT",
          user?.messId
        );
        const authUser: AuthUser = {
          userId: user?._id as string,
          name: user.name,
          email: user.email,
          role: user.role,
          messId: user.messId,
        };
        req.user = authUser;
      } else {
        req.user = {
          userId: user._id as string,
          name: user?.name,
          email: user?.email,
          role: user?.role,
        };
        console.log("decoded", decoded);
      }
      // Attach decoded user data to the request object

      // Proceed to the next middleware
      next();
    } catch (err) {
      console.error("JWT verification error:", err); // Log the error for debugging
      throw new AppError("Invalid token", 401, "INVALID_TOKEN");
    }
  }
);

// Role-based authorization middleware
