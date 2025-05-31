import { NextFunction, Request, Response } from "express";
import { IStatus } from "../../interfaces/global.interface";
import { sendResponse } from "../../lib/utils";
import { catchAsync } from "../../middlewares";
import { AppError } from "../../middlewares/errors";
import { ActivityEntity } from "./activity.interface";
import { getRecentActivities } from "./activity.service";

// Get recent activities
export const getRecentActivitiesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { messId, userId, dateFrom, dateTo, action, entity, limit, skip } =
      req.query;
    const authUser = req.user;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const activities = await getRecentActivities(
      {
        messId: messId as string | undefined,
        userId: userId as string | undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        action: action as IStatus | undefined,
        entity: entity as ActivityEntity | undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
      },
      authUser._id
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Recent activities retrieved successfully",
      data: { activities },
    });
  }
);
