import { NextFunction, Request, Response } from "express";
import {
  addActivityLog,
  createUser,
  forgotPassword,
  getUserByEmail,
  getUserById,
  getUsers,
  resetPassword,
  signIn,
  signUpUser,
  softDeleteUser,
  updatePassword,
  updateUser,
  verifyOtp,
} from "./user.service";

import { AuthUser } from "../../interfaces/global.interface";
import { sendResponse } from "../../lib/utils";
import { catchAsync } from "../../middlewares";
import { AppError } from "../../middlewares/errors";
import { UserRole } from "./user.interface";

// Sign up controller
export const signUpUserController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      email,
      gender,
      dateOfBirth,
      password,
      phone,
      address,
      profilePicture,
      nid,
      role,
      messId,
    } = req.body;

    const user = await signUpUser({
      name,
      email,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      password,
      phone,
      address,
      profilePicture,
      nid,
      role,
      messId,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User signed up successfully, OTP sent to email",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  }
);

export const signInController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const response = await signIn({ email, password });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User signed in successfully",
      data: { user: response.user, accessToken: response.accessToken },
    });
  }
);
// Verify OTP controller
export const verifyOtpController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;

    const user = await verifyOtp(email, otp);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OTP verified successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
    });
  }
);

// Forgot password controller
export const forgotPasswordController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await forgotPassword(email);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "OTP sent to email for password reset",
      data: null,
    });
  }
);

// Reset password controller
export const resetPasswordController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, resetToken, newPassword } = req.body;

    await resetPassword(email, otp, resetToken, newPassword);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  }
);

// Create user controller (admin only)
export const createUserController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      email,
      gender,
      dateOfBirth,
      password,
      phone,
      address,
      profilePicture,
      nid,
      role,
      messId,
    } = req.body;

    const user = await createUser({
      name,
      email,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      password,
      phone,
      address,
      profilePicture,
      nid,
      role,
      messId,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  }
);

// Get user by ID controller
export const getUserByIdController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await getUserById(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User retrieved successfully",
      data: { user },
    });
  }
);

// Get user by email controller
export const getUserByEmailController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.query;

    const user = await getUserByEmail(email as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User retrieved successfully",
      data: { user },
    });
  }
);

// Get users controller
export const getUsersController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { messId, role, isVerified, isBlocked, isApproved, limit, skip } =
      req.query;

    const filters = {
      messId: messId as string | undefined,
      role: role as UserRole | undefined,
      isVerified:
        isVerified === "true"
          ? true
          : isVerified === "false"
          ? false
          : undefined,
      isBlocked:
        isBlocked === "true" ? true : isBlocked === "false" ? false : undefined,
      isApproved:
        isApproved === "true"
          ? true
          : isApproved === "false"
          ? false
          : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      skip: skip ? parseInt(skip as string, 10) : undefined,
    };

    const users = await getUsers(filters);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users retrieved successfully",
      data: { users },
    });
  }
);

// Update user controller
export const updateUserController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const {
      name,
      gender,
      dateOfBirth,
      phone,
      address,
      profilePicture,
      nid,
      role,
      messId,
      balance,
      isVerified,
      isBlocked,
      isApproved,
    } = req.body;
    const authUser = req.user as AuthUser | undefined;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const user = await updateUser(
      userId,
      {
        name,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        phone,
        address,
        profilePicture,
        nid,
        role,
        messId,
        balance: balance ? Number(balance) : undefined,
        isVerified,
        isBlocked,
        isApproved,
      },
      {
        name: authUser.name,
        managerId: authUser.userId,
      }
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User updated successfully",
      data: { user },
    });
  }
);

// Update password controller
export const updatePasswordController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    await updatePassword(userId, newPassword);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password updated successfully",
      data: null,
    });
  }
);

// Soft delete user controller
export const softDeleteUserController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const authUser = req.user as AuthUser | undefined;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    await softDeleteUser(userId, {
      name: authUser.name,
      managerId: authUser.userId,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User soft deleted successfully",
      data: null,
    });
  }
);

// Add activity log controller
export const addActivityLogController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { action, performedBy } = req.body;
    const authUser = req.user as AuthUser | undefined;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    await addActivityLog(userId, {
      action,
      performedBy: {
        name: performedBy.name,
        managerId: performedBy.managerId,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Activity log added successfully",
      data: null,
    });
  }
);
