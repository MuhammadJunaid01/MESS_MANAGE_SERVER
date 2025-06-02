import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { AuthUser, IStatus } from "../../interfaces/global.interface";
import { sendResponse } from "../../lib/utils";
import { catchAsync } from "../../middlewares";
import { AppError } from "../../middlewares/errors";
import { ExpenseCategory } from "./expense.interface";
import {
  createExpense,
  getExpenseById,
  getExpenses,
  softDeleteExpense,
  updateExpense,
  updateExpenseStatus,
} from "./expense.service";

// Create expense
export const createExpenseController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category, amount, description, date, items } = req.body;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }
    const messId = new Types.ObjectId(authUser.messId);
    const userId = new Types.ObjectId(authUser.userId);
    if (!Types.ObjectId.isValid(messId) || !Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid mess ID or user ID", 400, "INVALID_MESS_ID ");
    }

    const expense = await createExpense(
      {
        messId,
        category,
        amount,
        description,
        date: new Date(date),
        items,
      },
      { userId: userId, name: authUser.name }
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  }
);

// Get expense by ID
export const getExpenseByIdController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { expenseId } = req.params;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const expense = await getExpenseById(expenseId, authUser.userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Expense retrieved successfully",
      data: { expense },
    });
  }
);

// Get expenses
export const getExpensesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      messId,
      status,
      category,
      dateFrom,
      dateTo,
      createdBy,
      limit,
      skip,
    } = req.query;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const filters = {
      messId: messId as string | undefined,
      status: status as IStatus | undefined,
      category: category as ExpenseCategory | undefined,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      createdBy: createdBy as string | undefined,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
    };

    const expenses = await getExpenses(filters, authUser.userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Expenses retrieved successfully",
      data: expenses,
    });
  }
);

// Update expense
export const updateExpenseController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { expenseId } = req.params;
    const { category, amount, description, date, items } = req.body;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const expense = await updateExpense(
      expenseId,
      {
        category,
        amount,
        description,
        date: date ? new Date(date) : undefined,
        items,
      },
      { userId: authUser.userId, name: authUser.name }
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Expense updated successfully",
      data: { expense },
    });
  }
);

// Update expense status
export const updateExpenseStatusController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { expenseId } = req.params;
    const { status } = req.body;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const expense = await updateExpenseStatus(
      expenseId,
      { status },
      { userId: authUser.userId, name: authUser.name }
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Expense ${status.toLowerCase()} successfully`,
      data: { expense },
    });
  }
);

// Soft delete expense
export const deleteExpenseController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { expenseId } = req.params;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    await softDeleteExpense(expenseId, {
      userId: authUser.userId,
      name: authUser.name,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Expense soft deleted successfully",
      data: null,
    });
  }
);
