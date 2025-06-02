"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpenseController = exports.updateExpenseStatusController = exports.updateExpenseController = exports.getExpensesController = exports.getExpenseByIdController = exports.createExpenseController = void 0;
const mongoose_1 = require("mongoose");
const utils_1 = require("../../lib/utils");
const middlewares_1 = require("../../middlewares");
const errors_1 = require("../../middlewares/errors");
const expense_service_1 = require("./expense.service");
// Create expense
exports.createExpenseController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { category, amount, description, date, items } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const messId = new mongoose_1.Types.ObjectId(authUser.messId);
    const userId = new mongoose_1.Types.ObjectId(authUser.userId);
    if (!mongoose_1.Types.ObjectId.isValid(messId) || !mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid mess ID or user ID", 400, "INVALID_MESS_ID ");
    }
    const expense = yield (0, expense_service_1.createExpense)({
        messId,
        category,
        amount,
        description,
        date: new Date(date),
        items,
    }, { userId: userId, name: authUser.name });
    (0, utils_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Expense created successfully",
        data: expense,
    });
}));
// Get expense by ID
exports.getExpenseByIdController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { expenseId } = req.params;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const expense = yield (0, expense_service_1.getExpenseById)(expenseId, authUser.userId);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Expense retrieved successfully",
        data: { expense },
    });
}));
// Get expenses
exports.getExpensesController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messId, status, category, dateFrom, dateTo, createdBy, limit, skip, } = req.query;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const filters = {
        messId: messId,
        status: status,
        category: category,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        createdBy: createdBy,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
    };
    const expenses = yield (0, expense_service_1.getExpenses)(filters, authUser.userId);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Expenses retrieved successfully",
        data: expenses,
    });
}));
// Update expense
exports.updateExpenseController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { expenseId } = req.params;
    const { category, amount, description, date, items } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const expense = yield (0, expense_service_1.updateExpense)(expenseId, {
        category,
        amount,
        description,
        date: date ? new Date(date) : undefined,
        items,
    }, { userId: authUser.userId, name: authUser.name });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Expense updated successfully",
        data: { expense },
    });
}));
// Update expense status
exports.updateExpenseStatusController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { expenseId } = req.params;
    const { status } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const expense = yield (0, expense_service_1.updateExpenseStatus)(expenseId, { status }, { userId: authUser.userId, name: authUser.name });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: `Expense ${status.toLowerCase()} successfully`,
        data: { expense },
    });
}));
// Soft delete expense
exports.deleteExpenseController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { expenseId } = req.params;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    yield (0, expense_service_1.softDeleteExpense)(expenseId, {
        userId: authUser.userId,
        name: authUser.name,
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Expense soft deleted successfully",
        data: null,
    });
}));
