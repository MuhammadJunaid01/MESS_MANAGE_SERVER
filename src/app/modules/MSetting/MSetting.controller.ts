import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { AuthUser } from "../../interfaces/global.interface";
import { sendResponse } from "../../lib/utils";
import { catchAsync } from "../../middlewares";
import { AppError } from "../../middlewares/errors";
import { createSetting, getSetting, updateSetting } from "./MSetting.service";

// Create a new setting
export const createSettingController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { breakfast, lunch, dinner, memberResponsibleForGrocery } = req.body;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }
    const userId = new Types.ObjectId(authUser.userId);
    const messId = new Types.ObjectId(authUser.messId);
    if (!messId || !userId) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }
    const setting = await createSetting(
      {
        messId,
        breakfast,
        lunch,
        dinner,
        memberResponsibleForGrocery,
      },
      authUser.userId
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Setting created successfully",
      data: { setting },
    });
  }
);

// Get setting by messId
export const getSettingController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }
    const userId = new Types.ObjectId(authUser.userId);
    const messId = new Types.ObjectId(authUser.messId);
    if (!messId || !userId) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }
    const setting = await getSetting(messId, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Setting retrieved successfully",
      data: { setting },
    });
  }
);

// Update setting
export const updateSettingController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { breakfast, lunch, dinner, memberResponsibleForGrocery } = req.body;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }
    const userId = new Types.ObjectId(authUser.userId);
    const messId = new Types.ObjectId(authUser.messId);
    if (!messId || !userId) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }
    const setting = await updateSetting(
      messId,
      {
        breakfast,
        lunch,
        dinner,
        memberResponsibleForGrocery,
      },
      userId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Setting updated successfully",
      data: { setting },
    });
  }
);
