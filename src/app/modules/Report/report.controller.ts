import { endOfMonth, startOfMonth } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { sendResponse } from "../../lib/utils";
import { catchAsync } from "../../middlewares";
import { AppError } from "../../middlewares/errors";
import {
  generateGroceryReport,
  generateMealReport,
  generateUsersMealReport,
} from "./report.service";

// Generate meal participation report
export const generateMealReportController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, dateFrom, dateTo, groupBy, limit, skip } = req.query;
    const authUser = req.user;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }
    const messId = new Types.ObjectId(authUser.messId);
    const report = await generateMealReport(
      {
        messId: messId,
        userId: userId as string | undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        groupBy: groupBy as "mess" | "user" | "date" | undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
      },
      authUser.userId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal report generated successfully",
      data: report,
    });
  }
);
export const generateGroceryReportController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { from, to } = req.query;
    const authUser = req.user;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }
    const messId = authUser.messId;
    if (!messId) {
      throw new AppError("Invalid messId", 400, "INVALID_MESS_ID");
    }
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());

    const filters = {
      messId: messId?.toString(),
      from: from ? String(from) : currentMonthStart.toISOString(),
      to: to ? String(to) : currentMonthEnd.toISOString(),
    };

    const report = await generateGroceryReport(filters, authUser.userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Grocery report generated successfully",
      data: report,
    });
  }
);
export const generateUsersMealReportController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { dateFrom, dateTo, limit, skip } = req.query;
    const authUser = req.user;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }
    const messId = authUser.messId;
    if (!messId) {
      throw new AppError("Invalid messId", 400, "INVALID_MESS_ID");
    }
    const report = await generateUsersMealReport(
      {
        messId: messId,
        dateFrom: dateFrom ? String(dateFrom) : undefined,
        dateTo: dateTo ? String(dateTo) : undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
      },
      authUser.userId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users meal report generated successfully",
      data: report,
    });
  }
);
