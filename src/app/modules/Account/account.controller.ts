import { NextFunction, Request, Response } from "express";
import { AuthUser } from "../../interfaces/global.interface";
import { sendResponse } from "../../lib/utils";
import { catchAsync } from "../../middlewares";
import { AppError } from "../../middlewares/errors";
import { TransactionType } from "./account.interface";
import {
  createAccount,
  createTransaction,
  getAccountById,
  getAccounts,
  getTransactions,
  softDeleteAccount,
} from "./account.service";

// Create account
export const createAccountController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, messId } = req.body;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const account = await createAccount(
      { userId, messId },
      { userId: authUser._id, name: authUser.name }
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Account created successfully",
      data: { account },
    });
  }
);

// Get account by ID
export const getAccountByIdController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accountId } = req.params;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const account = await getAccountById(accountId, authUser._id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Account retrieved successfully",
      data: { account },
    });
  }
);

// Get accounts
export const getAccountsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { messId, userId, limit, skip } = req.query;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const accounts = await getAccounts(
      {
        messId: messId as string | undefined,
        userId: userId as string | undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
      },
      authUser._id
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Accounts retrieved successfully",
      data: { accounts },
    });
  }
);

// Create transaction
export const createTransactionController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accountId, amount, type, description, date } = req.body;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const { account, transaction } = await createTransaction(
      {
        accountId,
        amount,
        type,
        description,
        date: new Date(date),
      },
      { userId: authUser._id, name: authUser.name }
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Transaction created successfully",
      data: { account, transaction },
    });
  }
);

// Get transactions
export const getTransactionsController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accountId, type, dateFrom, dateTo, limit, skip } = req.query;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const transactions = await getTransactions(
      {
        accountId: accountId as string,
        type: type as TransactionType | undefined,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
      },
      authUser._id
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Transactions retrieved successfully",
      data: { transactions },
    });
  }
);

// Soft delete account
export const deleteAccountController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accountId } = req.params;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    await softDeleteAccount(accountId, {
      userId: authUser._id,
      name: authUser.name,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Account soft deleted successfully",
      data: null,
    });
  }
);
