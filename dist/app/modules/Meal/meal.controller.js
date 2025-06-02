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
exports.createMealsForOneMonthUserController = exports.toggleMealsForDateRangeController = exports.deleteMealController = exports.updateMealController = exports.getMealsController = exports.getMealDetailsByUserIdController = exports.getMealByIdController = exports.createMealForOneMonthController = exports.createMealController = void 0;
const date_fns_1 = require("date-fns");
const mongoose_1 = require("mongoose");
const utils_1 = require("../../lib/utils");
const middlewares_1 = require("../../middlewares");
const errors_1 = require("../../middlewares/errors");
const user_interface_1 = require("../User/user.interface");
const user_schema_1 = __importDefault(require("../User/user.schema"));
const meal_service_1 = require("./meal.service");
// Create a new meal
exports.createMealController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, messId, date, meals } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const meal = yield (0, meal_service_1.createMeal)({
        userId,
        messId,
        date: new Date(date),
        meals,
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Meal created successfully",
        data: { meal },
    });
}));
exports.createMealForOneMonthController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("HIT createMealForOneMonthController");
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const messId = authUser.messId;
    if (!messId) {
        throw new errors_1.AppError("Invalid messId", 400, "INVALID_MESS_ID");
    }
    const meal = yield (0, meal_service_1.createMealsForOneMonth)(new mongoose_1.Types.ObjectId(messId));
    (0, utils_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Meal created successfully",
        data: { meal },
    });
}));
// Get meal by ID
exports.getMealByIdController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { mealId } = req.params;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const meal = yield (0, meal_service_1.getMealById)(mealId, authUser.userId);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Meal retrieved successfully",
        data: { meal },
    });
}));
exports.getMealDetailsByUserIdController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, userId, messId } = req.query;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    // Validate query parameters
    if (!userId || !messId) {
        throw new errors_1.AppError("userId and messId are required", 400, "MISSING_PARAMETERS");
    }
    // Use current month as default if dates are not provided
    const currentDate = new Date();
    const defaultFrom = (0, date_fns_1.startOfMonth)(currentDate);
    const defaultTo = (0, date_fns_1.endOfMonth)(currentDate);
    const input = {
        from: from ? new Date(from) : defaultFrom,
        to: to ? new Date(to) : defaultTo,
        userId: new mongoose_1.Types.ObjectId(userId),
        messId: new mongoose_1.Types.ObjectId(messId),
    };
    const mealDetails = yield (0, meal_service_1.getMealDetailsByUserId)(input);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Meal details retrieved successfully",
        data: mealDetails,
    });
}));
// Get meals with filters
exports.getMealsController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messId, userId, dateFrom, dateTo, limit, skip } = req.query;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    // Set default date range to current month if dateFrom and dateTo are undefined
    const currentDate = new Date();
    const defaultDateFrom = (0, date_fns_1.startOfMonth)(currentDate);
    const defaultDateTo = (0, date_fns_1.endOfMonth)(currentDate);
    const meals = yield (0, meal_service_1.getMeals)({
        messId: messId,
        userId: userId,
        dateFrom: dateFrom ? new Date(dateFrom) : defaultDateFrom,
        dateTo: dateTo ? new Date(dateTo) : defaultDateTo,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
    }, authUser.userId);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Meals retrieved successfully",
        data: { meals },
    });
}));
// Update meal
exports.updateMealController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { mealId } = req.params;
    const { meals, date } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const meal = yield (0, meal_service_1.updateMeal)(mealId, {
        userId: authUser.userId,
        meals,
        date: date ? new Date(date) : undefined,
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Meal updated successfully",
        data: { meal },
    });
}));
// Delete meal
exports.deleteMealController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { mealId } = req.params;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    yield (0, meal_service_1.deleteMeal)(mealId, authUser.userId);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Meal deleted successfully",
        data: null,
    });
}));
// Toggle meals for date range
exports.toggleMealsForDateRangeController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate, meals } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const userId = new mongoose_1.Types.ObjectId(authUser.userId);
    const messId = new mongoose_1.Types.ObjectId(authUser.messId);
    if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(messId)) {
        throw new errors_1.AppError("Invalid user or mess ID", 400, "INVALID_ID");
    }
    const updatedMeals = yield (0, meal_service_1.toggleMealsForDateRange)({
        userId,
        messId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        meals,
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Meals toggled successfully",
        data: { meals: updatedMeals },
    });
}));
exports.createMealsForOneMonthUserController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const authUser = req.user;
    // Validate authenticated user
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    // Validate input
    if (!userId) {
        throw new errors_1.AppError(" userId are required", 400, "MISSING_FIELDS");
    }
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    console.log("userId", userId);
    // Check if the authenticated user is authorized
    const user = yield user_schema_1.default.findOne({
        _id: userId,
        isApproved: true,
    });
    if (!user || !user.isApproved || !user.messId) {
        throw new errors_1.AppError("User is not approved or does not belong to a mess", 403, "NOT_APPROVED");
    }
    if (!mongoose_1.Types.ObjectId.isValid(user.messId)) {
        throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    const isAdminOrManager = [user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(authUser.role);
    if (!isAdminOrManager) {
        throw new errors_1.AppError("User is not authorized to create meals for this mess", 403, "NOT_MESS_MEMBER");
    }
    // Call the service function
    const result = yield (0, meal_service_1.createMonthlyMealsForUser)(new mongoose_1.Types.ObjectId(user.messId), new mongoose_1.Types.ObjectId(userId));
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: null,
    });
}));
