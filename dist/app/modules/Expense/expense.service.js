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
const global_interface_1 = require("../../interfaces/global.interface");
const errors_1 = require("../../middlewares/errors");
const activity_schema_1 = __importDefault(require("../Activity/activity.schema"));
const mess_schema_1 = __importDefault(require("../Mess/mess.schema"));
const user_interface_1 = require("../User/user.interface");
const user_schema_1 = __importDefault(require("../User/user.schema"));
const expense_interface_1 = require("./expense.interface");
const expense_schema_1 = __importDefault(require("./expense.schema"));
// Create a new expense
const createExpense = (input, createdBy) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        const { messId, category, amount, description, date, items } = input;
        if (!mongoose_1.Types.ObjectId.isValid(messId)) {
            throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
        }
        if (!mongoose_1.Types.ObjectId.isValid(createdBy.userId)) {
            throw new errors_1.AppError("Invalid creator ID", 400, "INVALID_USER_ID");
        }
        const mess = yield mess_schema_1.default.findById(messId).session(session);
        if (!mess || mess.isDeleted) {
            throw new errors_1.AppError("Mess not found", 404, "MESS_NOT_FOUND");
        }
        const user = yield user_schema_1.default.findOne({
            _id: createdBy.userId,
            messId,
            isApproved: true,
        }).session(session);
        if (!user) {
            throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
        }
        if (items && category !== expense_interface_1.ExpenseCategory.Grocery) {
            throw new errors_1.AppError("Items can only be specified for Grocery expenses", 400, "INVALID_ITEMS");
        }
        const expense = new expense_schema_1.default({
            messId: new mongoose_1.Types.ObjectId(messId),
            category,
            amount,
            description,
            date,
            items,
            createdBy: new mongoose_1.Types.ObjectId(createdBy.userId),
        });
        const newExpense = yield expense.save({ session });
        // Create activity log
        const activity = new activity_schema_1.default({
            messId: messId,
            entity: "Expense",
            entityId: newExpense._id,
            action: "created",
            performedBy: {
                userId: new mongoose_1.Types.ObjectId(createdBy.userId),
                name: createdBy.name,
            },
            timestamp: new Date(),
        });
        yield activity.save({ session });
        // Commit the transaction
        yield session.commitTransaction();
        return newExpense;
    }
    catch (error) {
        // Abort transaction on error
        yield session.abortTransaction();
        throw error;
    }
    finally {
        // Always end the session
        session.endSession();
    }
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
    const user = yield user_schema_1.default.findOne({
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
    const user = yield user_schema_1.default.findOne(Object.assign(Object.assign({ _id: userId }, (filters.messId ? { messId: filters.messId } : {})), { isApproved: true }));
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
    const user = yield user_schema_1.default.findOne({
        _id: updatedBy.userId,
        messId: expense.messId,
        isApproved: true,
    });
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
    }
    if (expense.status !== global_interface_1.IStatus.Pending) {
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
    yield activity_schema_1.default.create({
        messId: expense.messId,
        entity: "Expense",
        entityId: expenseId,
        action: "updated",
        performedBy: {
            userId: new mongoose_1.Types.ObjectId(updatedBy.userId),
            name: updatedBy.name,
        },
        timestamp: new Date(),
    });
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
    const user = yield user_schema_1.default.findOne({
        _id: performedBy.userId,
        messId: expense.messId,
        isApproved: true,
    });
    if (!user || ![user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(user.role)) {
        throw new errors_1.AppError("Only admins or managers can approve/reject expenses", 403, "FORBIDDEN");
    }
    if (expense.status !== global_interface_1.IStatus.Pending) {
        throw new errors_1.AppError("Only pending expenses can be approved/rejected", 400, "INVALID_STATUS");
    }
    if (![global_interface_1.IStatus.Approved, global_interface_1.IStatus.Rejected].includes(input.status)) {
        throw new errors_1.AppError("Invalid status update", 400, "INVALID_STATUS");
    }
    yield activity_schema_1.default.create({
        messId: expense.messId,
        entity: "Expense",
        entityId: expenseId,
        action: input.status,
        performedBy: {
            userId: new mongoose_1.Types.ObjectId(performedBy.userId),
            name: performedBy.name,
        },
        timestamp: new Date(),
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
    const user = yield user_schema_1.default.findOne({
        _id: deletedBy.userId,
        messId: expense.messId,
        isApproved: true,
    });
    if (!user || ![user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(user.role)) {
        throw new errors_1.AppError("Only admins or managers can delete expenses", 403, "FORBIDDEN");
    }
    expense.isDeleted = true;
    expense.deletedBy = new mongoose_1.Types.ObjectId(deletedBy.userId);
    expense.deletedAt = new Date();
    yield expense.save();
    yield activity_schema_1.default.create({
        messId: expense.messId,
        entity: "Expense",
        entityId: expenseId,
        action: "deleted",
        performedBy: {
            userId: new mongoose_1.Types.ObjectId(deletedBy.userId),
            name: deletedBy.name,
        },
        timestamp: new Date(),
    });
    yield expense.save();
});
exports.softDeleteExpense = softDeleteExpense;
