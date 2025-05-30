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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteAccount = exports.getTransactions = exports.createTransaction = exports.getAccounts = exports.getAccountById = exports.createAccount = void 0;
const mongoose_1 = require("mongoose");
const errors_1 = require("../../middlewares/errors");
const mess_schema_1 = __importDefault(require("../Mess/mess.schema"));
const transaction_schema_1 = __importDefault(require("../Transaction/transaction.schema"));
const user_interface_1 = require("../User/user.interface");
const user_model_1 = __importDefault(require("../User/user.model"));
const account_interface_1 = require("./account.interface");
const account_schema_1 = __importDefault(require("./account.schema"));
// Create a new account
const createAccount = (input, createdBy) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, messId } = input;
    if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(messId)) {
        throw new errors_1.AppError("Invalid user or mess ID", 400, "INVALID_ID");
    }
    if (!mongoose_1.Types.ObjectId.isValid(createdBy.userId)) {
        throw new errors_1.AppError("Invalid creator ID", 400, "INVALID_USER_ID");
    }
    const mess = yield mess_schema_1.default.findById(messId);
    if (!mess || mess.isDeleted) {
        throw new errors_1.AppError("Mess not found", 404, "MESS_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: userId,
        messId,
        isApproved: true,
    });
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
    }
    const creator = yield user_model_1.default.findById(createdBy.userId);
    if (!creator || ![user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(creator.role)) {
        throw new errors_1.AppError("Only admins or managers can create accounts", 403, "FORBIDDEN");
    }
    const existingAccount = yield account_schema_1.default.findOne({
        userId,
        messId,
        isDeleted: false,
    });
    if (existingAccount) {
        throw new errors_1.AppError("Account already exists for this user in this mess", 400, "ACCOUNT_EXISTS");
    }
    const account = yield account_schema_1.default.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        messId: new mongoose_1.Types.ObjectId(messId),
        balance: 0,
        createdBy: new mongoose_1.Types.ObjectId(createdBy.userId),
        activityLogs: [
            {
                action: "created",
                performedBy: {
                    userId: new mongoose_1.Types.ObjectId(createdBy.userId),
                    name: createdBy.name,
                },
                timestamp: new Date(),
            },
        ],
    });
    return account;
});
exports.createAccount = createAccount;
// Get account by ID
const getAccountById = (accountId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(accountId) || !mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid account or user ID", 400, "INVALID_ID");
    }
    const account = yield account_schema_1.default.findOne({
        _id: accountId,
        isDeleted: false,
    })
        .select("-activityLogs")
        .populate("userId", "name email")
        .populate("messId", "name messId");
    if (!account) {
        throw new errors_1.AppError("Account not found", 404, "ACCOUNT_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: userId,
        messId: account.messId,
        isApproved: true,
    });
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
    }
    return account;
});
exports.getAccountById = getAccountById;
// Get accounts with filters
const getAccounts = (filters, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    if (filters.messId && !mongoose_1.Types.ObjectId.isValid(filters.messId)) {
        throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    if (filters.userId && !mongoose_1.Types.ObjectId.isValid(filters.userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    const user = yield user_model_1.default.findOne(Object.assign(Object.assign({ _id: userId }, (filters.messId ? { messId: filters.messId } : {})), { isApproved: true }));
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
    }
    const query = { isDeleted: false };
    if (filters.messId)
        query.messId = new mongoose_1.Types.ObjectId(filters.messId);
    if (filters.userId)
        query.userId = new mongoose_1.Types.ObjectId(filters.userId);
    return account_schema_1.default.find(query)
        .select("-activityLogs")
        .populate("userId", "name email")
        .populate("messId", "name messId")
        .limit(filters.limit || 100)
        .skip(filters.skip || 0)
        .sort({ createdAt: -1 });
});
exports.getAccounts = getAccounts;
// Create a transaction
const createTransaction = (input, createdBy) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(input.accountId) ||
        !mongoose_1.Types.ObjectId.isValid(createdBy.userId)) {
        throw new errors_1.AppError("Invalid account or user ID", 400, "INVALID_ID");
    }
    const account = yield account_schema_1.default.findOne({
        _id: input.accountId,
        isDeleted: false,
    });
    if (!account) {
        throw new errors_1.AppError("Account not found", 404, "ACCOUNT_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: createdBy.userId,
        messId: account.messId,
        isApproved: true,
    });
    if (!user || ![user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(user.role)) {
        throw new errors_1.AppError("Only admins or managers can create transactions", 403, "FORBIDDEN");
    }
    const { amount, type, description, date } = input;
    const balanceUpdate = type === account_interface_1.TransactionType.Credit ? amount : -amount;
    const newBalance = account.balance + balanceUpdate;
    if (newBalance < 0) {
        throw new errors_1.AppError("Insufficient balance for debit", 400, "INSUFFICIENT_BALANCE");
    }
    const transaction = yield transaction_schema_1.default.create({
        accountId: new mongoose_1.Types.ObjectId(input.accountId),
        amount,
        type,
        description,
        date,
        createdBy: new mongoose_1.Types.ObjectId(createdBy.userId),
        activityLogs: [
            {
                action: type === account_interface_1.TransactionType.Credit ? "credited" : "debited",
                performedBy: {
                    userId: new mongoose_1.Types.ObjectId(createdBy.userId),
                    name: createdBy.name,
                },
                timestamp: new Date(),
            },
        ],
    });
    account.balance = newBalance;
    account.updatedBy = new mongoose_1.Types.ObjectId(createdBy.userId);
    account.activityLogs.push({
        action: account_interface_1.IActivityAction.Created,
        performedBy: {
            userId: new mongoose_1.Types.ObjectId(createdBy.userId),
            name: createdBy.name,
        },
        timestamp: new Date(),
    });
    yield account.save();
    return { account, transaction };
});
exports.createTransaction = createTransaction;
// Get transactions for an account
const getTransactions = (filters, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(filters.accountId) ||
        !mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid account or user ID", 400, "INVALID_ID");
    }
    const account = yield account_schema_1.default.findOne({
        _id: filters.accountId,
        isDeleted: false,
    });
    if (!account) {
        throw new errors_1.AppError("Account not found", 404, "ACCOUNT_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: userId,
        messId: account.messId,
        isApproved: true,
    });
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
    }
    const query = { accountId: new mongoose_1.Types.ObjectId(filters.accountId) };
    if (filters.type)
        query.type = filters.type;
    if (filters.dateFrom || filters.dateTo) {
        query.date = {};
        if (filters.dateFrom)
            query.date.$gte = filters.dateFrom;
        if (filters.dateTo)
            query.date.$lte = filters.dateTo;
    }
    return transaction_schema_1.default.find(query)
        .select("-activityLogs")
        .populate("createdBy", "name email")
        .limit(filters.limit || 100)
        .skip(filters.skip || 0)
        .sort({ date: -1 });
});
exports.getTransactions = getTransactions;
// Soft delete account
const softDeleteAccount = (accountId, deletedBy) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(accountId) ||
        !mongoose_1.Types.ObjectId.isValid(deletedBy.userId)) {
        throw new errors_1.AppError("Invalid account or user ID", 400, "INVALID_ID");
    }
    const account = yield account_schema_1.default.findOne({
        _id: accountId,
        isDeleted: false,
    });
    if (!account) {
        throw new errors_1.AppError("Account not found", 404, "ACCOUNT_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: deletedBy.userId,
        messId: account.messId,
        isApproved: true,
    });
    if (!user || ![user_interface_1.UserRole.Admin].includes(user.role)) {
        throw new errors_1.AppError("Only admins can delete accounts", 403, "FORBIDDEN");
    }
    account.isDeleted = true;
    account.updatedBy = new mongoose_1.Types.ObjectId(deletedBy.userId);
    account.activityLogs.push({
        action: account_interface_1.IActivityAction.Deleted,
        performedBy: {
            userId: new mongoose_1.Types.ObjectId(deletedBy.userId),
            name: deletedBy.name,
        },
        timestamp: new Date(),
    });
    yield account.save();
});
exports.softDeleteAccount = softDeleteAccount;
