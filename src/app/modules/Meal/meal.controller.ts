import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { AuthUser } from "../../interfaces/global.interface";
import { sendResponse } from "../../lib/utils";
import { catchAsync } from "../../middlewares";
import { AppError } from "../../middlewares/errors";
import {
  createMeal,
  createMealsForOneMonth,
  deleteMeal,
  getMealById,
  getMeals,
  toggleMealsForDateRange,
  updateMeal,
} from "./meal.service";

// Create a new meal
export const createMealController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, messId, date, meals } = req.body;
    const authUser = req.user;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const meal = await createMeal({
      userId,
      messId,
      date: new Date(date),
      meals,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Meal created successfully",
      data: { meal },
    });
  }
);
export const createMealForOneMonthController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("HIT createMealForOneMonthController");
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
    const meal = await createMealsForOneMonth(new Types.ObjectId(messId));

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Meal created successfully",
      data: { meal },
    });
  }
);

// Get meal by ID
export const getMealByIdController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mealId } = req.params;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const meal = await getMealById(mealId, authUser.userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal retrieved successfully",
      data: { meal },
    });
  }
);

// Get meals with filters
export const getMealsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { messId, userId, dateFrom, dateTo, limit, skip } = req.query;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const meals = await getMeals(
      {
        messId: messId as string | undefined,
        userId: userId as string | undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
      },
      authUser.userId
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meals retrieved successfully",
      data: { meals },
    });
  }
);

// Update meal
export const updateMealController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mealId } = req.params;
    const { meals, date } = req.body;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const meal = await updateMeal(mealId, {
      userId: authUser.userId,
      meals,
      date: date ? new Date(date) : undefined,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal updated successfully",
      data: { meal },
    });
  }
);

// Delete meal
export const deleteMealController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mealId } = req.params;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    await deleteMeal(mealId, authUser.userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal deleted successfully",
      data: null,
    });
  }
);

// Toggle meals for date range
export const toggleMealsForDateRangeController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate, meals } = req.body;
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

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(messId)) {
      throw new AppError("Invalid user or mess ID", 400, "INVALID_ID");
    }

    const updatedMeals = await toggleMealsForDateRange({
      userId,
      messId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      meals,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meals toggled successfully",
      data: { meals: updatedMeals },
    });
  }
);
