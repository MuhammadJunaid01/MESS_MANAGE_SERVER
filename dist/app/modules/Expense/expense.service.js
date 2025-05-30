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
exports.softDeleteExpense = exports.updateExpenseStatus = exports.updateExpense = exports.getExpenses = exports.getExpenseById = exports.createExpense = void 0;
const mongoose_1 = require("mongoose");
const errors_1 = require("../../middlewares/errors");
const mess_schema_1 = __importDefault(require("../Mess/mess.schema"));
const user_interface_1 = require("../User/user.interface");
const user_model_1 = __importDefault(require("../User/user.model"));
const expense_interface_1 = require("./expense.interface");
const expense_schema_1 = __importDefault(require("./expense.schema"));
// Create a new expense
const createExpense = (input, createdBy) => __awaiter(void 0, void 0, void 0, function* () {
    const { messId, category, amount, description, date, items } = input;
    if (!mongoose_1.Types.ObjectId.isValid(messId)) {
        throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    if (!mongoose_1.Types.ObjectId.isValid(createdBy.userId)) {
        throw new errors_1.AppError("Invalid creator ID", 400, "INVALID_USER_ID");
    }
    const mess = yield mess_schema_1.default.findById(messId);
    if (!mess || mess.isDeleted) {
        throw new errors_1.AppError("Mess not found", 404, "MESS_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: createdBy.userId,
        messId,
        isApproved: true,
    });
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
    }
    if (items && category !== expense_interface_1.ExpenseCategory.Grocery) {
        throw new errors_1.AppError("Items can only be specified for Grocery expenses", 400, "INVALID_ITEMS");
    }
    const expense = yield expense_schema_1.default.create({
        messId: new mongoose_1.Types.ObjectId(messId),
        category,
        amount,
        description,
        date,
        items,
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
    return expense;
});
exports.createExpense = createExpense;
// Get expense by ID
const getExpenseById = (expenseId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(expenseId)) {
        throw new errors_1.AppError("Invalid expense ID", 400, "INVALID_EXPENSE_ID");
    }
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    const expense = yield expense_schema_1.default.findOne({
        _id: expenseId,
        isDeleted: false,
    })
        .select("-activityLogs")
        .populate("createdBy", "name email")
        .populate("messId", "name messId");
    if (!expense) {
        throw new errors_1.AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: userId,
        messId: expense.messId,
        isApproved: true,
    });
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
    }
    return expense;
});
exports.getExpenseById = getExpenseById;
// Get expenses with filters
const getExpenses = (filters, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    if (filters.messId && !mongoose_1.Types.ObjectId.isValid(filters.messId)) {
        throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    const user = yield user_model_1.default.findOne(Object.assign(Object.assign({ _id: userId }, (filters.messId ? { messId: filters.messId } : {})), { isApproved: true }));
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
    }
    const query = { isDeleted: false };
    if (filters.messId)
        query.messId = new mongoose_1.Types.ObjectId(filters.messId);
    if (filters.status)
        query.status = filters.status;
    if (filters.category)
        query.category = filters.category;
    if (filters.createdBy && mongoose_1.Types.ObjectId.isValid(filters.createdBy)) {
        query.createdBy = new mongoose_1.Types.ObjectId(filters.createdBy);
    }
    if (filters.dateFrom || filters.dateTo) {
        query.date = {};
        if (filters.dateFrom)
            query.date.$gte = filters.dateFrom;
        if (filters.dateTo)
            query.date.$lte = filters.dateTo;
    }
    return expense_schema_1.default.find(query)
        .select("-activityLogs")
        .populate("createdBy", "name email")
        .populate("messId", "name messId")
        .limit(filters.limit || 100)
        .skip(filters.skip || 0)
        .sort({ date: -1 });
});
exports.getExpenses = getExpenses;
// Update expense
const updateExpense = (expenseId, input, updatedBy) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(expenseId)) {
        throw new errors_1.AppError("Invalid expense ID", 400, "INVALID_EXPENSE_ID");
    }
    if (!mongoose_1.Types.ObjectId.isValid(updatedBy.userId)) {
        throw new errors_1.AppError("Invalid updater ID", 400, "INVALID_USER_ID");
    }
    const expense = yield expense_schema_1.default.findOne({
        _id: expenseId,
        isDeleted: false,
    });
    if (!expense) {
        throw new errors_1.AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: updatedBy.userId,
        messId: expense.messId,
        isApproved: true,
    });
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
    }
    if (expense.status !== expense_interface_1.ExpenseStatus.Pending) {
        throw new errors_1.AppError("Only pending expenses can be updated", 400, "INVALID_STATUS");
    }
    if (input.items && expense.category !== expense_interface_1.ExpenseCategory.Grocery) {
        throw new errors_1.AppError("Items can only be specified for Grocery expenses", 400, "INVALID_ITEMS");
    }
    const updateData = {};
    if (input.category)
        updateData.category = input.category;
    if (input.amount !== undefined)
        updateData.amount = input.amount;
    if (input.description)
        updateData.description = input.description;
    if (input.date)
        updateData.date = input.date;
    if (input.items)
        updateData.items = input.items;
    expense.set(Object.assign(Object.assign({}, updateData), { updatedBy: new mongoose_1.Types.ObjectId(updatedBy.userId), activityLogs: [
            ...expense.activityLogs,
            {
                action: "updated",
                performedBy: {
                    userId: new mongoose_1.Types.ObjectId(updatedBy.userId),
                    name: updatedBy.name,
                },
                timestamp: new Date(),
            },
        ] }));
    yield expense.save();
    return expense;
});
exports.updateExpense = updateExpense;
// Update expense status (approve/reject)
const updateExpenseStatus = (expenseId, input, performedBy) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(expenseId)) {
        throw new errors_1.AppError("Invalid expense ID", 400, "INVALID_EXPENSE_ID");
    }
    if (!mongoose_1.Types.ObjectId.isValid(performedBy.userId)) {
        throw new errors_1.AppError("Invalid performer ID", 400, "INVALID_USER_ID");
    }
    const expense = yield expense_schema_1.default.findOne({
        _id: expenseId,
        isDeleted: false,
    });
    if (!expense) {
        throw new errors_1.AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: performedBy.userId,
        messId: expense.messId,
        isApproved: true,
    });
    if (!user || ![user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(user.role)) {
        throw new errors_1.AppError("Only admins or managers can approve/reject expenses", 403, "FORBIDDEN");
    }
    if (expense.status !== expense_interface_1.ExpenseStatus.Pending) {
        throw new errors_1.AppError("Only pending expenses can be approved/rejected", 400, "INVALID_STATUS");
    }
    if (![expense_interface_1.ExpenseStatus.Approved, expense_interface_1.ExpenseStatus.Rejected].includes(input.status)) {
        throw new errors_1.AppError("Invalid status update", 400, "INVALID_STATUS");
    }
    expense.set({
        status: input.status,
        activityLogs: [
            ...expense.activityLogs,
            {
                action: input.status === expense_interface_1.ExpenseStatus.Approved ? "approved" : "rejected",
                performedBy: {
                    userId: new mongoose_1.Types.ObjectId(performedBy.userId),
                    name: performedBy.name,
                },
                timestamp: new Date(),
            },
        ],
    });
    yield expense.save();
    return expense;
});
exports.updateExpenseStatus = updateExpenseStatus;
// Soft delete expense
const softDeleteExpense = (expenseId, deletedBy) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(expenseId)) {
        throw new errors_1.AppError("Invalid expense ID", 400, "INVALID_EXPENSE_ID");
    }
    if (!mongoose_1.Types.ObjectId.isValid(deletedBy.userId)) {
        throw new errors_1.AppError("Invalid deleter ID", 400, "INVALID_USER_ID");
    }
    const expense = yield expense_schema_1.default.findOne({
        _id: expenseId,
        isDeleted: false,
    });
    if (!expense) {
        throw new errors_1.AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: deletedBy.userId,
        messId: expense.messId,
        isApproved: true,
    });
    if (!user || ![user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(user.role)) {
        throw new errors_1.AppError("Only admins or managers can delete expenses", 403, "FORBIDDEN");
    }
    expense.set({
        isDeleted: true,
        updatedBy: new mongoose_1.Types.ObjectId(deletedBy.userId),
        activityLogs: [
            ...expense.activityLogs,
            {
                action: "deleted",
                performedBy: {
                    userId: new mongoose_1.Types.ObjectId(deletedBy.userId),
                    name: deletedBy.name,
                },
                timestamp: new Date(),
            },
        ],
    });
    yield expense.save();
});
exports.softDeleteExpense = softDeleteExpense;
