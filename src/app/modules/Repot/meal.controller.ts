import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../lib/utils";
import { catchAsync } from "../../middlewares";
import { AppError } from "../../middlewares/errors";
import { generateMealReport } from "./report.service";

// Generate meal participation report
export const generateMealReportController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { messId, userId, dateFrom, dateTo, groupBy, limit, skip } =
      req.query;
    const authUser = req.user;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const report = await generateMealReport(
      {
        messId: messId as string | undefined,
        userId: userId as string | undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        groupBy: groupBy as "mess" | "user" | "date" | undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
      },
      authUser._id
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal report generated successfully",
      data: { report },
    });
  }
);
