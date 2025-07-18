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
exports.generateMealReport = void 0;
const mongoose_1 = require("mongoose");
const global_interface_1 = require("../../interfaces/global.interface");
const errors_1 = require("../../middlewares/errors");
const expense_interface_1 = require("../Expense/expense.interface");
const expense_schema_1 = __importDefault(require("../Expense/expense.schema"));
const meal_interface_1 = require("../Meal/meal.interface");
const meal_schema_1 = __importDefault(require("../Meal/meal.schema"));
const mess_schema_1 = __importDefault(require("../Mess/mess.schema"));
const user_interface_1 = require("../User/user.interface");
const user_model_1 = __importDefault(require("../User/user.model"));
const generateMealReport = (filters, authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(authUserId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    if (filters.messId && !mongoose_1.Types.ObjectId.isValid(filters.messId)) {
        throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    if (filters.userId && !mongoose_1.Types.ObjectId.isValid(filters.userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    const user = yield user_model_1.default.findById(authUserId);
    if (!user || !user.isApproved) {
        throw new errors_1.AppError("User is not approved", 403, "NOT_APPROVED");
    }
    // Restrict to user's mess unless Admin/Manager
    const isAdminOrManager = [user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(user.role);
    if (!isAdminOrManager &&
        filters.messId &&
        (!user.messId || filters.messId !== user.messId.toString())) {
        throw new errors_1.AppError("User is not a member of this mess", 403, "NOT_MESS_MEMBER");
    }
    // Match stage for meals
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
    const groupByField = filters.groupBy || "mess";
    const groupId = {};
    if (groupByField === "mess")
        groupId.messId = "$messId";
    if (groupByField === "user")
        groupId.userId = "$userId";
    if (groupByField === "date")
        groupId.date = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
    // Aggregate meals
    const mealPipeline = [
        { $match: mealMatch },
        { $unwind: "$meals" },
        {
            $group: {
                _id: groupId,
                totalMeals: { $sum: 1 },
                totalActiveMeals: {
                    $sum: { $cond: ["$meals.isActive", 1, 0] },
                },
                breakfastActive: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$meals.type", meal_interface_1.MealType.Breakfast] },
                                    { $eq: ["$meals.isActive", true] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                breakfastInactive: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$meals.type", meal_interface_1.MealType.Breakfast] },
                                    { $eq: ["$meals.isActive", false] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                lunchActive: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$meals.type", meal_interface_1.MealType.Lunch] },
                                    { $eq: ["$meals.isActive", true] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                lunchInactive: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$meals.type", meal_interface_1.MealType.Lunch] },
                                    { $eq: ["$meals.isActive", false] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                dinnerActive: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$meals.type", meal_interface_1.MealType.Dinner] },
                                    { $eq: ["$meals.isActive", true] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                dinnerInactive: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$meals.type", meal_interface_1.MealType.Dinner] },
                                    { $eq: ["$meals.isActive", false] },
                                ],
                            },
                            1,
                            0,
                        ],
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
                _id: groupByField === "mess"
                    ? { messId: "$messId" }
                    : groupByField === "user"
                        ? { createdBy: "$createdBy" }
                        : {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        },
                totalCost: { $sum: "$amount" },
            },
        },
    ];
    const [mealResults, expenseResults] = yield Promise.all([
        meal_schema_1.default.aggregate(mealPipeline),
        expense_schema_1.default.aggregate(expensePipeline),
    ]);
    // Merge meal and expense data
    const report = mealResults.map((mealItem) => {
        const expenseItem = expenseResults.find((exp) => {
            var _a, _b, _c, _d;
            if (groupByField === "mess")
                return ((_a = exp._id.messId) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = mealItem._id.messId) === null || _b === void 0 ? void 0 : _b.toString());
            if (groupByField === "user")
                return (((_c = exp._id.createdBy) === null || _c === void 0 ? void 0 : _c.toString()) === ((_d = mealItem._id.userId) === null || _d === void 0 ? void 0 : _d.toString()));
            if (groupByField === "date")
                return exp._id.date === mealItem._id.date;
            return false;
        });
        const totalCost = (expenseItem === null || expenseItem === void 0 ? void 0 : expenseItem.totalCost) || 0;
        const totalActiveMeals = mealItem.totalActiveMeals || 0;
        const perMealRate = totalActiveMeals > 0 ? totalCost / totalActiveMeals : 0;
        return {
            _id: mealItem._id,
            totalMeals: mealItem.totalMeals,
            totalActiveMeals,
            totalCost,
            perMealRate: Number(perMealRate.toFixed(2)),
            breakfast: {
                active: mealItem.breakfastActive,
                inactive: mealItem.breakfastInactive,
            },
            lunch: { active: mealItem.lunchActive, inactive: mealItem.lunchInactive },
            dinner: {
                active: mealItem.dinnerActive,
                inactive: mealItem.dinnerInactive,
            },
        };
    });
    // Populate messId and userId
    const populatedReport = yield Promise.all(report.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        const result = Object.assign({}, item);
        if (item._id.messId) {
            const mess = yield mess_schema_1.default.findById(item._id.messId).select("name messId");
            result._id.mess = mess
                ? { _id: mess._id, name: mess.name, messId: mess.messId }
                : null;
            delete result._id.messId;
        }
        if (item._id.userId) {
            const user = yield user_model_1.default.findById(item._id.userId).select("name email");
            result._id.user = user
                ? { _id: user._id, name: user.name, email: user.email }
                : null;
            delete result._id.userId;
        }
        return result;
    })));
    return populatedReport
        .sort((a, b) => (a._id.mess || a._id.user || a._id.date || "").localeCompare(b._id.mess || b._id.user || b._id.date || ""))
        .slice(filters.skip || 0, (filters.skip || 0) + (filters.limit || 100));
});
exports.generateMealReport = generateMealReport;
