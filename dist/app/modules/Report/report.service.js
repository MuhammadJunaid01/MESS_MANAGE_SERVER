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
exports.generateGroceryReport = exports.generateUsersMealReport = exports.generateMealReport = void 0;
const mongoose_1 = require("mongoose");
const global_interface_1 = require("../../interfaces/global.interface");
const errors_1 = require("../../middlewares/errors");
const expense_interface_1 = require("../Expense/expense.interface");
const expense_schema_1 = __importDefault(require("../Expense/expense.schema"));
const meal_interface_1 = require("../Meal/meal.interface");
const meal_schema_1 = __importDefault(require("../Meal/meal.schema"));
const MSetting_schema_1 = __importDefault(require("../MSetting/MSetting.schema"));
const user_interface_1 = require("../User/user.interface");
const user_schema_1 = __importDefault(require("../User/user.schema"));
const generateMealReport = (filters, authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    try {
        if (!filters) {
            throw new errors_1.AppError("Filters object is required", 400, "MISSING_FILTERS");
        }
        if (!mongoose_1.Types.ObjectId.isValid(authUserId)) {
            throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
        }
        if (filters.messId && !mongoose_1.Types.ObjectId.isValid(filters.messId)) {
            throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
        }
        const setting = yield MSetting_schema_1.default.findOne({
            messId: filters.messId,
        }).session(session);
        if (!setting) {
            throw new errors_1.AppError("Setting not found", 404, "SETTING_NOT_FOUND");
        }
        const enabledMeals = {
            breakfast: setting.breakfast,
            lunch: setting.lunch,
            dinner: setting.dinner,
        };
        const user = yield user_schema_1.default.findById(authUserId);
        if (!user || !user.isApproved) {
            throw new errors_1.AppError("User is not approved", 403, "NOT_APPROVED");
        }
        if (filters.messId &&
            (!user.messId || !user.messId.equals(filters.messId))) {
            throw new errors_1.AppError("User is not a member of this mess", 403, "NOT_MESS_MEMBER");
        }
        const mealMatch = {};
        if (filters.messId)
            mealMatch.messId = new mongoose_1.Types.ObjectId(filters.messId);
        if (filters.userId)
            mealMatch.userId = new mongoose_1.Types.ObjectId(filters.userId);
        if (filters.dateFrom || filters.dateTo) {
            mealMatch.date = {};
            if (filters.dateFrom)
                mealMatch.date.$gte = new Date(filters.dateFrom);
            if (filters.dateTo)
                mealMatch.date.$lte = new Date(filters.dateTo);
        }
        const mealTypeMap = {
            breakfast: meal_interface_1.MealType.Breakfast,
            lunch: meal_interface_1.MealType.Lunch,
            dinner: meal_interface_1.MealType.Dinner,
        };
        // Array of enabled meal types
        const enabledMealTypes = Object.keys(enabledMeals)
            .filter((type) => enabledMeals[type])
            .map((type) => mealTypeMap[type]);
        const mealPipeline = [
            { $match: mealMatch },
            { $unwind: "$meals" },
            // Filter only enabled meal types
            {
                $match: {
                    "meals.type": { $in: enabledMealTypes },
                },
            },
            {
                $group: Object.assign(Object.assign({ _id: null, totalMeals: { $sum: "$meals.numberOfMeals" }, totalActiveMeals: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$meals.isActive", true] },
                                        { $gt: ["$meals.numberOfMeals", 0] },
                                    ],
                                },
                                "$meals.numberOfMeals",
                                0,
                            ],
                        },
                    } }, Object.keys(enabledMeals).reduce((acc, type) => {
                    if (enabledMeals[type]) {
                        acc[`${type}Active`] = {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ["$meals.type", mealTypeMap[type]] },
                                            { $eq: ["$meals.isActive", true] },
                                            { $gt: ["$meals.numberOfMeals", 0] },
                                        ],
                                    },
                                    "$meals.numberOfMeals",
                                    0,
                                ],
                            },
                        };
                        acc[`${type}Inactive`] = {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ["$meals.type", mealTypeMap[type]] },
                                            {
                                                $or: [
                                                    { $eq: ["$meals.isActive", false] },
                                                    { $eq: ["$meals.numberOfMeals", 0] },
                                                ],
                                            },
                                        ],
                                    },
                                    "$meals.numberOfMeals",
                                    0,
                                ],
                            },
                        };
                    }
                    return acc;
                }, {})), { messId: { $first: "$messId" }, userId: filters.userId ? { $first: "$userId" } : { $first: null } }),
            },
            {
                $lookup: {
                    from: "messes",
                    localField: "messId",
                    foreignField: "_id",
                    as: "mess",
                },
            },
            { $unwind: { path: "$mess", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $project: Object.assign({ _id: {
                        mess: {
                            $cond: [
                                { $ifNull: ["$mess", false] },
                                {
                                    _id: "$mess._id",
                                    name: "$mess.name",
                                    messId: "$mess.messId",
                                },
                                null,
                            ],
                        },
                        user: {
                            $cond: [
                                { $ifNull: ["$user", false] },
                                {
                                    _id: "$user._id",
                                    name: "$user.name",
                                    email: "$user.email",
                                },
                                null,
                            ],
                        },
                        date: null, // No date grouping, so set to null
                    }, totalMeals: 1, totalActiveMeals: 1 }, Object.keys(enabledMeals).reduce((acc, type) => {
                    if (enabledMeals[type]) {
                        acc[type] = {
                            active: `$${type}Active`,
                            inactive: `$${type}Inactive`,
                            total: { $add: [`$${type}Active`, `$${type}Inactive`] },
                        };
                    }
                    return acc;
                }, {})),
            },
        ];
        const expenseMatch = {
            messId: filters.messId,
            category: expense_interface_1.ExpenseCategory.Grocery,
            status: global_interface_1.IStatus.Approved,
        };
        if (filters.dateFrom || filters.dateTo) {
            expenseMatch.date = {};
            if (filters.dateFrom)
                expenseMatch.date.$gte = new Date(filters.dateFrom);
            if (filters.dateTo)
                expenseMatch.date.$lte = new Date(filters.dateTo);
        }
        const expensePipeline = [
            { $match: expenseMatch },
            {
                $group: {
                    _id: null,
                    totalApprovedExpense: { $sum: "$amount" },
                },
            },
        ];
        const [mealResults, expenseResults] = yield Promise.all([
            meal_schema_1.default.aggregate(mealPipeline).session(session),
            expense_schema_1.default.aggregate(expensePipeline).session(session),
        ]);
        const totalApprovedExpense = expenseResults.length > 0 ? expenseResults[0].totalApprovedExpense : 0;
        const mealItem = mealResults[0] || {
            totalMeals: 0,
            totalActiveMeals: 0,
            breakfast: null,
            lunch: null,
            dinner: null,
            _id: { mess: null, user: null, date: null },
        };
        const totalActiveMeals = mealItem.totalActiveMeals || 0;
        const perMealRate = totalActiveMeals > 0 ? totalApprovedExpense / totalActiveMeals : 0;
        const report = {
            _id: mealItem._id,
            totalMeals: mealItem.totalMeals || 0,
            totalActiveMeals: totalActiveMeals,
            totalCost: totalApprovedExpense,
            perMealRate,
            breakfast: enabledMeals.breakfast && mealItem.breakfast
                ? {
                    active: mealItem.breakfast.active || 0,
                    inactive: mealItem.breakfast.inactive || 0,
                    total: mealItem.breakfast.total || 0,
                }
                : undefined,
            lunch: enabledMeals.lunch && mealItem.lunch
                ? {
                    active: mealItem.lunch.active || 0,
                    inactive: mealItem.lunch.inactive || 0,
                    total: mealItem.lunch.total || 0,
                }
                : undefined,
            dinner: enabledMeals.dinner && mealItem.dinner
                ? {
                    active: mealItem.dinner.active || 0,
                    inactive: mealItem.dinner.inactive || 0,
                    total: mealItem.dinner.total || 0,
                }
                : undefined,
        };
        return report;
    }
    catch (error) {
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
exports.generateMealReport = generateMealReport;
const generateUsersMealReport = (filters, authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!filters) {
        throw new errors_1.AppError("Filters object is required", 400, "MISSING_FILTERS");
    }
    if (!mongoose_1.Types.ObjectId.isValid(authUserId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    if (filters.messId && !mongoose_1.Types.ObjectId.isValid(filters.messId)) {
        throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    const user = yield user_schema_1.default.findById(authUserId);
    if (!user || !user.isApproved) {
        throw new errors_1.AppError("User is not approved", 403, "NOT_APPROVED");
    }
    // Restrict to user's mess unless Admin/Manager
    const isAdminOrManager = [user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(user.role);
    if (
    // !isAdminOrManager &&
    filters.messId &&
        (!user.messId || !user.messId.equals(filters.messId))) {
        throw new errors_1.AppError("User is not a member of this mess", 403, "NOT_MESS_MEMBER");
    }
    // Match stage for meals
    const mealMatch = {
        userId: { $exists: true },
    };
    if (filters.messId)
        mealMatch.messId = new mongoose_1.Types.ObjectId(filters.messId);
    if (filters.dateFrom || filters.dateTo) {
        mealMatch.date = {};
        if (filters.dateFrom)
            mealMatch.date.$gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            mealMatch.date.$lte = new Date(filters.dateTo);
    }
    // Match stage for expenses
    const expenseMatch = {
        category: expense_interface_1.ExpenseCategory.Grocery,
        status: global_interface_1.IStatus.Approved,
        isDeleted: false,
    };
    if (filters.messId)
        expenseMatch.messId = new mongoose_1.Types.ObjectId(filters.messId);
    if (filters.dateFrom || filters.dateTo) {
        expenseMatch.date = {};
        if (filters.dateFrom)
            expenseMatch.date.$gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            expenseMatch.date.$lte = new Date(filters.dateTo);
    }
    // Aggregate meals
    const mealPipeline = [
        { $match: mealMatch },
        { $unwind: "$meals" },
        {
            $group: {
                _id: "$userId",
                totalMeals: { $sum: "$meals.numberOfMeals" },
                totalActiveMeals: {
                    $sum: {
                        $cond: ["$meals.isActive", "$meals.numberOfMeals", 0],
                    },
                },
            },
        },
    ];
    // Aggregate expenses
    const expensePipeline = [
        { $match: expenseMatch },
        {
            $group: {
                _id: "$createdBy",
                totalCost: { $sum: "$amount" },
            },
        },
    ];
    const [mealResults, expenseResults] = yield Promise.all([
        meal_schema_1.default.aggregate(mealPipeline),
        expense_schema_1.default.aggregate(expensePipeline),
    ]);
    // Merge meal and expense data
    const report = yield Promise.all(mealResults.map((mealItem) => __awaiter(void 0, void 0, void 0, function* () {
        const expenseItem = expenseResults.find((exp) => { var _a, _b; return ((_a = exp._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = mealItem._id) === null || _b === void 0 ? void 0 : _b.toString()); });
        const user = yield user_schema_1.default.findById(mealItem._id).select("name");
        if (!user) {
            return null; // Skip if user not found
        }
        return {
            _id: mealItem._id.toString(),
            name: user.name,
            totalMeals: mealItem.totalMeals || 0,
            totalActiveMeals: mealItem.totalActiveMeals || 0,
            totalCost: (expenseItem === null || expenseItem === void 0 ? void 0 : expenseItem.totalCost) || 0,
        };
    })));
    // Filter out null entries and sort by name
    return report
        .filter((item) => item !== null)
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(filters.skip || 0, (filters.skip || 0) + (filters.limit || 100));
});
exports.generateUsersMealReport = generateUsersMealReport;
const generateGroceryReport = (filters, authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    try {
        if (!filters) {
            throw new errors_1.AppError("Filters object is required", 400, "MISSING_FILTERS");
        }
        if (!mongoose_1.Types.ObjectId.isValid(authUserId)) {
            throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
        }
        if (filters.messId && !mongoose_1.Types.ObjectId.isValid(filters.messId)) {
            throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
        }
        const user = yield user_schema_1.default.findById(authUserId).session(session);
        if (!user || !user.isApproved) {
            throw new errors_1.AppError("User is not approved", 403, "NOT_APPROVED");
        }
        if (filters.messId &&
            (!user.messId || !user.messId.equals(filters.messId))) {
            throw new errors_1.AppError("User is not a member of this mess", 403, "NOT_MESS_MEMBER");
        }
        const expenseMatch = {
            messId: filters.messId ? new mongoose_1.Types.ObjectId(filters.messId) : undefined,
            category: expense_interface_1.ExpenseCategory.Grocery,
            status: global_interface_1.IStatus.Approved,
            isDeleted: false,
        };
        if (filters.from || filters.to) {
            expenseMatch.date = {};
            if (filters.from)
                expenseMatch.date.$gte = new Date(filters.from);
            if (filters.to)
                expenseMatch.date.$lte = new Date(filters.to);
        }
        const pipeline = [
            { $match: expenseMatch },
            { $unwind: { path: "$items" } },
            {
                $group: {
                    _id: {
                        category: "$items.category",
                        unit: "$items.unit",
                    },
                    total: { $sum: "$items.quantity" },
                    price: { $sum: "$items.price" },
                    quantity: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id.category",
                    unit: "$_id.unit",
                    total: 1,
                    price: 1,
                    quantity: 1,
                },
            },
            { $sort: { name: 1, unit: 1 } },
        ];
        const results = yield expense_schema_1.default.aggregate(pipeline).session(session);
        const report = results.map((item) => ({
            name: item.name,
            unit: item.unit,
            total: item.total,
            price: item.price,
            quantity: item.quantity,
        }));
        return report;
    }
    catch (error) {
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
exports.generateGroceryReport = generateGroceryReport;
