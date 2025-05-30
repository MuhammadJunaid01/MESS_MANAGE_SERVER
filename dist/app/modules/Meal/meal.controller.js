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
exports.toggleMealsForDateRangeController = exports.deleteMealController = exports.updateMealController = exports.getMealsController = exports.getMealByIdController = exports.createMealController = void 0;
const utils_1 = require("../../lib/utils");
const middlewares_1 = require("../../middlewares");
const errors_1 = require("../../middlewares/errors");
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
// Get meal by ID
exports.getMealByIdController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { mealId } = req.params;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const meal = yield (0, meal_service_1.getMealById)(mealId, authUser._id);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Meal retrieved successfully",
        data: { meal },
    });
}));
// Get meals with filters
exports.getMealsController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messId, userId, dateFrom, dateTo, limit, skip } = req.query;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const meals = yield (0, meal_service_1.getMeals)({
        messId: messId,
        userId: userId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
    }, authUser._id);
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
        userId: authUser._id,
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
    yield (0, meal_service_1.deleteMeal)(mealId, authUser._id);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Meal deleted successfully",
        data: null,
    });
}));
// Toggle meals for date range
exports.toggleMealsForDateRangeController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, messId, startDate, endDate, meals } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
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
