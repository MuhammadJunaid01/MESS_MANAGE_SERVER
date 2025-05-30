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
exports.toggleMealsForDateRange = exports.deleteMeal = exports.updateMeal = exports.getMeals = exports.getMealById = exports.createMeal = void 0;
const mongoose_1 = require("mongoose");
const errors_1 = require("../../middlewares/errors");
const mess_schema_1 = __importDefault(require("../Mess/mess.schema"));
const user_interface_1 = require("../User/user.interface");
const user_model_1 = __importDefault(require("../User/user.model"));
const meal_interface_1 = require("./meal.interface");
const meal_schema_1 = __importDefault(require("./meal.schema"));
// Create a new meal
const createMeal = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, messId, date, meals } = input;
    if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(messId)) {
        throw new errors_1.AppError("Invalid user or mess ID", 400, "INVALID_ID");
    }
    const mess = yield mess_schema_1.default.findById(messId);
    if (!mess) {
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
    const mealDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (mealDate.getTime() < today.getTime()) {
        throw new errors_1.AppError("Cannot create meal for past dates", 400, "INVALID_DATE");
    }
    const existingMeal = yield meal_schema_1.default.findOne({
        userId,
        messId,
        date: mealDate,
    });
    if (existingMeal) {
        throw new errors_1.AppError("Meal already exists for this user on this date", 400, "MEAL_EXISTS");
    }
    const validMealTypes = Object.values(meal_interface_1.MealType);
    if (!meals.every((meal) => validMealTypes.includes(meal.type))) {
        throw new errors_1.AppError("Invalid meal type", 400, "INVALID_MEAL_TYPE");
    }
    const meal = yield meal_schema_1.default.create({
        userId: new mongoose_1.Types.ObjectId(userId),
        messId: new mongoose_1.Types.ObjectId(messId),
        date: mealDate,
        meals,
    });
    return meal;
});
exports.createMeal = createMeal;
// Get meal by ID
const getMealById = (mealId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(mealId) || !mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid meal or user ID", 400, "INVALID_ID");
    }
    const meal = yield meal_schema_1.default.findById(mealId)
        .populate("userId", "name email")
        .populate("messId", "name messId");
    if (!meal) {
        throw new errors_1.AppError("Meal not found", 404, "MEAL_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: userId,
        messId: meal.messId,
        isApproved: true,
    });
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
    }
    return meal;
});
exports.getMealById = getMealById;
// Get meals with filters
const getMeals = (filters, userId) => __awaiter(void 0, void 0, void 0, function* () {
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
    const query = {};
    if (filters.messId)
        query.messId = new mongoose_1.Types.ObjectId(filters.messId);
    if (filters.userId)
        query.userId = new mongoose_1.Types.ObjectId(filters.userId);
    if (filters.dateFrom || filters.dateTo) {
        query.date = {};
        if (filters.dateFrom)
            query.date.$gte = filters.dateFrom;
        if (filters.dateTo)
            query.date.$lte = filters.dateTo;
    }
    return meal_schema_1.default.find(query)
        .populate("userId", "name email")
        .populate("messId", "name messId")
        .limit(filters.limit || 100)
        .skip(filters.skip || 0)
        .sort({ date: 1 });
});
exports.getMeals = getMeals;
// Update meal
const updateMeal = (mealId, input) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(mealId)) {
        throw new errors_1.AppError("Invalid meal ID", 400, "INVALID_ID");
    }
    const meal = yield meal_schema_1.default.findById(mealId);
    if (!meal) {
        throw new errors_1.AppError("Meal not found", 404, "MEAL_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: input.userId || meal.userId,
        messId: meal.messId,
        isApproved: true,
    });
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
    }
    const updateData = {};
    if (input.meals) {
        const validMealTypes = Object.values(meal_interface_1.MealType);
        if (!input.meals.every((m) => validMealTypes.includes(m.type))) {
            throw new errors_1.AppError("Invalid meal type", 400, "INVALID_MEAL_TYPE");
        }
        updateData.meals = input.meals;
    }
    if (input.date) {
        const mealDate = new Date(input.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (mealDate.getTime() < today.getTime()) {
            throw new errors_1.AppError("Cannot update meal to past dates", 400, "INVALID_DATE");
        }
        updateData.date = mealDate;
    }
    Object.assign(meal, updateData);
    yield meal.save();
    return meal;
});
exports.updateMeal = updateMeal;
// Delete meal
const deleteMeal = (mealId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(mealId) || !mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid meal or user ID", 400, "INVALID_ID");
    }
    const meal = yield meal_schema_1.default.findById(mealId);
    if (!meal) {
        throw new errors_1.AppError("Meal not found", 404, "MEAL_NOT_FOUND");
    }
    const user = yield user_model_1.default.findOne({
        _id: userId,
        messId: meal.messId,
        isVerified: true,
    });
    if (!user || ![user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(user.role)) {
        throw new errors_1.AppError("Only admins or managers can delete meals", 403, "FORBIDDEN");
    }
    yield meal.deleteOne();
});
exports.deleteMeal = deleteMeal;
// Toggle meals for date range
const toggleMealsForDateRange = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, messId, startDate, endDate, meals } = input;
    if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(messId)) {
        throw new errors_1.AppError("Invalid user or mess ID", 400, "INVALID_ID");
    }
    const mess = yield mess_schema_1.default.findById(messId);
    if (!mess) {
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
        throw new errors_1.AppError("Start date must be before end date", 400, "INVALID_DATE_RANGE");
    }
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    if (start.getTime() < todayMidnight.getTime()) {
        throw new errors_1.AppError("Cannot toggle meals for past dates", 400, "INVALID_DATE");
    }
    const validMealTypes = Object.values(meal_interface_1.MealType);
    if (!meals.every((m) => validMealTypes.includes(m.type))) {
        throw new errors_1.AppError("Invalid meal type", 400, "INVALID_MEAL_TYPE");
    }
    const updatedMeals = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
        const date = new Date(currentDate);
        let meal = yield meal_schema_1.default.findOne({ userId, messId, date });
        if (meal) {
            meal.meals = meals;
            yield meal.save();
            updatedMeals.push(meal);
        }
        else {
            const newMeal = yield meal_schema_1.default.create({
                userId: new mongoose_1.Types.ObjectId(userId),
                messId: new mongoose_1.Types.ObjectId(messId),
                date,
                meals,
            });
            updatedMeals.push(newMeal);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return updatedMeals;
});
exports.toggleMealsForDateRange = toggleMealsForDateRange;
