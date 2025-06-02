import { endOfMonth, startOfMonth } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { AuthUser } from "../../interfaces/global.interface";
import { sendResponse } from "../../lib/utils";
import { catchAsync } from "../../middlewares";
import { AppError } from "../../middlewares/errors";
import { UserRole } from "../User/user.interface";
import UserModel from "../User/user.schema";
import {
  createMeal,
  createMealsForOneMonth,
  createMonthlyMealsForUser,
  deleteMeal,
  getMealById,
  getMealDetailsByUserId,
  getMeals,
  IMealDetailsInputByUserId,
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
export const getMealDetailsByUserIdController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { from, to, userId, messId } = req.query;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    // Validate query parameters
    if (!userId || !messId) {
      throw new AppError(
        "userId and messId are required",
        400,
        "MISSING_PARAMETERS"
      );
    }

    // Use current month as default if dates are not provided
    const currentDate = new Date();
    const defaultFrom = startOfMonth(currentDate);
    const defaultTo = endOfMonth(currentDate);

    const input: IMealDetailsInputByUserId = {
      from: from ? new Date(from as string) : defaultFrom,
      to: to ? new Date(to as string) : defaultTo,
      userId: new Types.ObjectId(userId as string),
      messId: new Types.ObjectId(messId as string),
    };

    const mealDetails = await getMealDetailsByUserId(input);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Meal details retrieved successfully",
      data: mealDetails,
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

    // Set default date range to current month if dateFrom and dateTo are undefined
    const currentDate = new Date();
    const defaultDateFrom = startOfMonth(currentDate);
    const defaultDateTo = endOfMonth(currentDate);

    const meals = await getMeals(
      {
        messId: messId as string | undefined,
        userId: userId as string | undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : defaultDateFrom,
        dateTo: dateTo ? new Date(dateTo as string) : defaultDateTo,
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
export const createMealsForOneMonthUserController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    const authUser = req.user;

    // Validate authenticated user
    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    // Validate input
    if (!userId) {
      throw new AppError(" userId are required", 400, "MISSING_FIELDS");
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    console.log("userId", userId);
    // Check if the authenticated user is authorized
    const user = await UserModel.findOne({
      _id: userId,
      isApproved: true,
    });
    if (!user || !user.isApproved || !user.messId) {
      throw new AppError(
        "User is not approved or does not belong to a mess",
        403,
        "NOT_APPROVED"
      );
    }

    if (!Types.ObjectId.isValid(user.messId)) {
      throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }

    const isAdminOrManager = [UserRole.Admin, UserRole.Manager].includes(
      authUser.role
    );
    if (!isAdminOrManager) {
      throw new AppError(
        "User is not authorized to create meals for this mess",
        403,
        "NOT_MESS_MEMBER"
      );
    }

    // Call the service function
    const result = await createMonthlyMealsForUser(
      new Types.ObjectId(user.messId),
      new Types.ObjectId(userId)
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: null,
    });
  }
);
