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
exports.deleteAccountController = exports.getTransactionsController = exports.createTransactionController = exports.getAccountsController = exports.getAccountByIdController = exports.createAccountController = void 0;
const utils_1 = require("../../lib/utils");
const middlewares_1 = require("../../middlewares");
const errors_1 = require("../../middlewares/errors");
const account_service_1 = require("./account.service");
// Create account
exports.createAccountController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, messId } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const account = yield (0, account_service_1.createAccount)({ userId, messId }, { userId: authUser._id, name: authUser.name });
    (0, utils_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Account created successfully",
        data: { account },
    });
}));
// Get account by ID
exports.getAccountByIdController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountId } = req.params;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const account = yield (0, account_service_1.getAccountById)(accountId, authUser._id);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Account retrieved successfully",
        data: { account },
    });
}));
// Get accounts
exports.getAccountsController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messId, userId, limit, skip } = req.query;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const accounts = yield (0, account_service_1.getAccounts)({
        messId: messId,
        userId: userId,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
    }, authUser._id);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Accounts retrieved successfully",
        data: { accounts },
    });
}));
// Create transaction
exports.createTransactionController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountId, amount, type, description, date } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const { account, transaction } = yield (0, account_service_1.createTransaction)({
        accountId,
        amount,
        type,
        description,
        date: new Date(date),
    }, { userId: authUser._id, name: authUser.name });
    (0, utils_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Transaction created successfully",
        data: { account, transaction },
    });
}));
// Get transactions
exports.getTransactionsController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountId, type, dateFrom, dateTo, limit, skip } = req.query;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const transactions = yield (0, account_service_1.getTransactions)({
        accountId: accountId,
        type: type,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
    }, authUser._id);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Transactions retrieved successfully",
        data: { transactions },
    });
}));
// Soft delete account
exports.deleteAccountController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountId } = req.params;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    yield (0, account_service_1.softDeleteAccount)(accountId, {
        userId: authUser._id,
        name: authUser.name,
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Account soft deleted successfully",
        data: null,
    });
}));
