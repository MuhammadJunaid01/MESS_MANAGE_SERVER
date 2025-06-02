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
exports.getMealDetailsByUserId = exports.createMonthlyMealsForUser = exports.createMealsForOneMonth = exports.toggleMealsForDateRange = exports.deleteMeal = exports.updateMeal = exports.getMeals = exports.getMealById = exports.createMeal = void 0;
const date_fns_1 = require("date-fns");
const mongoose_1 = require("mongoose");
const errors_1 = require("../../middlewares/errors");
const activity_schema_1 = __importDefault(require("../Activity/activity.schema"));
const mess_schema_1 = __importDefault(require("../Mess/mess.schema"));
const MSetting_schema_1 = __importDefault(require("../MSetting/MSetting.schema"));
const user_interface_1 = require("../User/user.interface");
const user_schema_1 = __importDefault(require("../User/user.schema"));
const meal_interface_1 = require("./meal.interface");
const meal_schema_1 = __importDefault(require("./meal.schema"));
// Create a new meal
const createMeal = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, messId, date, meals } = input;
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        // Validate IDs
        if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(messId)) {
            throw new errors_1.AppError("Invalid user or mess ID", 400, "INVALID_ID");
        }
        // Check if the mess exists
        const mess = yield mess_schema_1.default.findById(messId).session(session);
        if (!mess) {
            throw new errors_1.AppError("Mess not found", 404, "MESS_NOT_FOUND");
        }
        // Check if the user is approved and belongs to the mess
        const user = yield user_schema_1.default.findOne({
            _id: userId,
            messId,
            isApproved: true,
        }).session(session);
        if (!user) {
            throw new errors_1.AppError("User is not an approved member of this mess", 403, "NOT_MESS_MEMBER");
        }
        // Validate date
        const mealDate = (0, date_fns_1.startOfDay)(new Date(date));
        const today = (0, date_fns_1.startOfDay)(new Date());
        if ((0, date_fns_1.isBefore)(mealDate, today)) {
            throw new errors_1.AppError("Cannot create meal for past dates", 400, "INVALID_DATE");
        }
        // Check for existing meal
        const existingMeal = yield meal_schema_1.default.findOne({
            userId,
            messId,
            date: mealDate,
        }).session(session);
        if (existingMeal) {
            throw new errors_1.AppError("Meal already exists for this user on this date", 400, "MEAL_EXISTS");
        }
        // Validate meal types
        const validMealTypes = Object.values(meal_interface_1.MealType);
        if (!meals.every((meal) => validMealTypes.includes(meal.type))) {
            throw new errors_1.AppError("Invalid meal type", 400, "INVALID_MEAL_TYPE");
        }
        // Create and save the meal
        const meal = new meal_schema_1.default({
            userId: new mongoose_1.Types.ObjectId(userId),
            messId: new mongoose_1.Types.ObjectId(messId),
            date: mealDate,
            meals,
        });
        const savedMeal = yield meal.save({ session });
        // Log activity
        const activity = new activity_schema_1.default({
            messId: new mongoose_1.Types.ObjectId(messId),
            entity: "Meal",
            entityId: savedMeal._id,
            action: "create",
            performedBy: {
                userId: new mongoose_1.Types.ObjectId(userId),
                name: user.name,
            },
        });
        yield activity.save({ session });
        yield session.commitTransaction();
        return savedMeal;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
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
    const user = yield user_schema_1.default.findOne({
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
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
        }
        if (filters.messId && !mongoose_1.Types.ObjectId.isValid(filters.messId)) {
            throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
        }
        if (filters.userId && !mongoose_1.Types.ObjectId.isValid(filters.userId)) {
            throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
        }
        const user = yield user_schema_1.default.findOne(Object.assign({ _id: userId }, (filters.messId ? { messId: filters.messId } : {}))).session(session);
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
        const meals = yield meal_schema_1.default.find(query)
            // .populate("userId", "name email")
            // .populate("messId", "name messId")
            .limit(filters.limit || 100)
            .skip(filters.skip || 0)
            .sort({ date: -1 })
            .session(session);
        yield session.commitTransaction();
        return meals;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.getMeals = getMeals;
// Update meal
const updateMeal = (mealId, input) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        if (!mongoose_1.Types.ObjectId.isValid(mealId)) {
            throw new errors_1.AppError("Invalid meal ID", 400, "INVALID_ID");
        }
        const meal = yield meal_schema_1.default.findById(mealId).session(session);
        if (!meal) {
            throw new errors_1.AppError("Meal not found", 404, "MEAL_NOT_FOUND");
        }
        const user = yield user_schema_1.default.findOne({
            _id: input.userId || meal.userId,
            messId: meal.messId,
            isApproved: true,
        }).session(session);
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
            const mealDate = (0, date_fns_1.startOfDay)((0, date_fns_1.parseISO)(new Date(input.date).toISOString()));
            const today = (0, date_fns_1.startOfDay)(new Date());
            if (mealDate.getTime() < today.getTime()) {
                throw new errors_1.AppError("Cannot update meal to past dates", 400, "INVALID_DATE");
            }
            updateData.date = mealDate;
        }
        Object.assign(meal, updateData);
        yield meal.save({ session });
        const activity = new activity_schema_1.default({
            messId: meal.messId,
            entity: "Meal",
            entityId: meal._id,
            action: "update",
            performedBy: {
                userId: user._id,
                name: user.name,
            },
            timestamp: new Date(),
        });
        yield activity.save({ session });
        yield session.commitTransaction();
        return meal;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.updateMeal = updateMeal;
// Delete meal
const deleteMeal = (mealId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        if (!mongoose_1.Types.ObjectId.isValid(mealId) || !mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new errors_1.AppError("Invalid meal or user ID", 400, "INVALID_ID");
        }
        const meal = yield meal_schema_1.default.findById(mealId).session(session);
        if (!meal) {
            throw new errors_1.AppError("Meal not found", 404, "MEAL_NOT_FOUND");
        }
        const user = yield user_schema_1.default.findOne({
            _id: userId,
            messId: meal.messId,
            isVerified: true,
        }).session(session);
        if (!user || ![user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(user.role)) {
            throw new errors_1.AppError("Only admins or managers can delete meals", 403, "FORBIDDEN");
        }
        const activity = new activity_schema_1.default({
            messId: meal.messId,
            entity: "Meal",
            entityId: meal._id,
            action: "delete",
            performedBy: {
                userId: user._id,
                name: user.name,
            },
            timestamp: new Date(),
        });
        yield activity.save({ session });
        yield meal.deleteOne({ session });
        yield session.commitTransaction();
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.deleteMeal = deleteMeal;
// Toggle meals for date range
const toggleMealsForDateRange = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        const { userId, messId, startDate, endDate, meals } = input;
        // Fetch settings for the mess
        const setting = yield MSetting_schema_1.default.findOne({ messId }).session(session);
        if (!setting) {
            throw new errors_1.AppError("Settings not found for mess", 404, "SETTINGS_NOT_FOUND");
        }
        // Validate meal types against mess settings
        const enabledMealTypes = {
            [meal_interface_1.MealType.Breakfast]: setting.breakfast,
            [meal_interface_1.MealType.Lunch]: setting.lunch,
            [meal_interface_1.MealType.Dinner]: setting.dinner,
        };
        const invalidMealTypes = meals.filter((meal) => !enabledMealTypes[meal.type]);
        if (invalidMealTypes.length > 0) {
            const invalidTypes = invalidMealTypes.map((m) => m.type).join(", ");
            throw new errors_1.AppError(`Meal types [${invalidTypes}] are not enabled`, 400, "INVALID_MEAL_TYPES");
        }
        // Validate user and mess existence
        if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(messId)) {
            throw new errors_1.AppError("Invalid user or mess ID", 400, "INVALID_ID");
        }
        const mess = yield mess_schema_1.default.findById(messId).session(session);
        if (!mess)
            throw new errors_1.AppError("Mess not found", 404, "MESS_NOT_FOUND");
        const user = yield user_schema_1.default.findOne({
            _id: userId,
            messId,
            isApproved: true,
        }).session(session);
        if (!user)
            throw new errors_1.AppError("User is not an approved member", 403, "NOT_MESS_MEMBER");
        // Validate date range
        const start = (0, date_fns_1.parseISO)(new Date(startDate).toISOString());
        const end = (0, date_fns_1.parseISO)(new Date(endDate).toISOString());
        if ((0, date_fns_1.isAfter)(start, end)) {
            throw new errors_1.AppError("Start date must be before end date", 400, "INVALID_DATE_RANGE");
        }
        // Prevent toggling for past dates
        const todayMidnight = (0, date_fns_1.startOfDay)(new Date());
        if ((0, date_fns_1.isBefore)(start, todayMidnight)) {
            throw new errors_1.AppError("Cannot toggle meals for past dates", 400, "INVALID_DATE");
        }
        const updatedMeals = [];
        let currentDate = start;
        // Iterate through the date range
        while (!(0, date_fns_1.isAfter)(currentDate, end)) {
            const date = (0, date_fns_1.startOfDay)(currentDate);
            const meal = yield meal_schema_1.default.findOne({ userId, messId, date }).session(session);
            if (meal) {
                // Update meals array for the existing meal document
                meal.meals = meals;
                yield meal.save({ session });
                updatedMeals.push(meal);
            }
            else {
                console.log(`No existing meal for user ${userId} on ${date}. Skipping.`);
            }
            currentDate = (0, date_fns_1.addDays)(currentDate, 1);
        }
        yield session.commitTransaction();
        console.log("HIT toggleMealsForDateRange");
        console.log("updatedMeals", updatedMeals);
        return updatedMeals;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.toggleMealsForDateRange = toggleMealsForDateRange;
const createMealsForOneMonth = (messId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`Running meal creation cron job for mess ${messId}`);
        // Validate messId
        if (!mongoose_1.Types.ObjectId.isValid(messId)) {
            throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
        }
        // Fetch the mess settings
        const settings = yield MSetting_schema_1.default.findOne({ messId }).lean();
        if (!settings) {
            throw new errors_1.AppError(`No settings found for mess ${messId}. Please configure settings first.`, 404, "SETTINGS_NOT_FOUND");
        }
        // Fetch the specified mess
        const mess = yield mess_schema_1.default.findOne({
            _id: messId,
            isDeleted: false,
            status: "active",
        });
        if (!mess) {
            throw new errors_1.AppError(`Mess with ID ${messId} not found or inactive.`, 404, "MESS_NOT_FOUND");
        }
        const currentMonth = (0, date_fns_1.startOfMonth)(new Date());
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = (0, date_fns_1.getDaysInMonth)(currentMonth);
        // Check if meals are already created for the current month
        const existingMeals = yield meal_schema_1.default.exists({
            messId: mess._id,
            date: {
                $gte: new Date(year, month, 1),
                $lte: new Date(year, month, daysInMonth),
            },
        });
        if (existingMeals) {
            throw new errors_1.AppError(`Meals already exist for mess ${mess._id} for the current month.`, 400, "MEALS_ALREADY_EXIST");
        }
        // Fetch all approved users for the mess
        const users = yield user_schema_1.default.find({
            messId: mess._id,
            isApproved: true,
            isBlocked: false,
            isVerified: true,
        });
        if (users.length === 0) {
            console.log(`No users found for mess ${mess._id}.`);
            return;
        }
        const bulkOps = [];
        // Generate meal entries for each user for each day of the month
        for (const user of users) {
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                // Build meals array based on settings
                const meals = [];
                if (settings.breakfast) {
                    meals.push({
                        type: meal_interface_1.MealType.Breakfast,
                        isActive: true,
                        numberOfMeals: 0,
                    });
                }
                if (settings.lunch) {
                    meals.push({
                        type: meal_interface_1.MealType.Lunch,
                        isActive: true,
                        numberOfMeals: 0,
                    });
                }
                if (settings.dinner) {
                    meals.push({
                        type: meal_interface_1.MealType.Dinner,
                        isActive: true,
                        numberOfMeals: 0,
                    });
                }
                // Push the document to bulk operations if meals are defined
                if (meals.length > 0) {
                    bulkOps.push({
                        insertOne: {
                            document: {
                                userId: user._id,
                                messId: mess._id,
                                date,
                                meals,
                            },
                        },
                    });
                }
            }
        }
        // Execute bulk write operation
        if (bulkOps.length > 0) {
            yield meal_schema_1.default.bulkWrite(bulkOps, { ordered: false });
            console.log(`Created meals for mess ${mess._id} for ${users.length} users based on settings.`);
        }
        else {
            console.log(`No meals to create for mess ${mess._id}.`);
        }
    }
    catch (err) {
        throw err;
    }
});
exports.createMealsForOneMonth = createMealsForOneMonth;
const createMonthlyMealsForUser = (messId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        // Validate messId
        const settings = yield MSetting_schema_1.default.findOne({ messId }).session(session);
        if (!settings) {
            throw new errors_1.AppError("Settings not found for mess", 404, "SETTINGS_NOT_FOUND");
        }
        console.log(`Running meal creation for mess ${messId} and user ${userId}`);
        // Validate messId and userId
        if (!mongoose_1.Types.ObjectId.isValid(messId)) {
            throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
        }
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
        }
        // Fetch the specified mess
        const mess = yield mess_schema_1.default.findOne({
            _id: messId,
            isDeleted: false,
            status: "active",
        }).session(session);
        if (!mess) {
            throw new errors_1.AppError(`Mess with ID ${messId} not found or inactive`, 404, "MESS_NOT_FOUND");
        }
        // Fetch the specified user
        const user = yield user_schema_1.default.findOne({
            _id: userId,
            messId: mess._id,
            isApproved: true,
            isBlocked: false,
            isVerified: true,
        }).session(session);
        if (!user) {
            throw new errors_1.AppError(`User with ID ${userId} not found, not approved, or does not belong to mess ${messId}`, 404, "USER_NOT_FOUND");
        }
        const currentMonth = (0, date_fns_1.startOfMonth)(new Date());
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = (0, date_fns_1.getDaysInMonth)(currentMonth);
        // Check if meals are already created for the user for the current month
        const existingMeals = yield meal_schema_1.default.exists({
            messId: mess._id,
            userId: user._id,
            date: {
                $gte: new Date(year, month, 1),
                $lte: new Date(year, month, daysInMonth),
            },
        }).session(session);
        if (existingMeals) {
            throw new errors_1.AppError(`Meals already exist for user ${user._id} in mess ${mess._id} for the current month`, 400, "MEALS_ALREADY_EXIST");
        }
        const bulkOps = [];
        console.log("settings", settings);
        // Generate meal entries for the user for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            // Create meals array based on settings
            const meals = [];
            if (settings.breakfast) {
                meals.push({
                    type: meal_interface_1.MealType.Breakfast,
                    isActive: true,
                    numberOfMeals: 0,
                });
            }
            if (settings.lunch) {
                meals.push({ type: meal_interface_1.MealType.Lunch, isActive: true, numberOfMeals: 0 });
            }
            if (settings.dinner) {
                meals.push({ type: meal_interface_1.MealType.Dinner, isActive: true, numberOfMeals: 0 });
            }
            // Only push to bulkOps if there are meals to create
            if (meals.length > 0) {
                bulkOps.push({
                    insertOne: {
                        document: {
                            userId: user._id,
                            messId: mess._id,
                            date,
                            meals,
                        },
                    },
                });
            }
        }
        // Filter out null values from bulkOps
        const validBulkOps = bulkOps.filter((op) => op !== null);
        // Execute bulk write
        if (validBulkOps.length > 0) {
            yield meal_schema_1.default.bulkWrite(validBulkOps, { ordered: false, session });
            console.log(`Created meals for user ${user._id} in mess ${mess._id} for the current month`);
        }
        else {
            console.log(`No meals created for user ${user._id} as all meal types are disabled in settings`);
        }
        yield session.commitTransaction();
        return { message: `Meals created successfully for user ${user._id}` };
    }
    catch (err) {
        yield session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
});
exports.createMonthlyMealsForUser = createMonthlyMealsForUser;
const getMealDetailsByUserId = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, to, userId, messId } = input;
    // Validate input
    if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(messId)) {
        throw new errors_1.AppError("Invalid user or mess ID", 400, "INVALID_ID");
    }
    if (!(0, date_fns_1.isValid)(from) || !(0, date_fns_1.isValid)(to)) {
        throw new errors_1.AppError("Invalid date format", 400, "INVALID_DATE");
    }
    if ((0, date_fns_1.isAfter)(from, to)) {
        throw new errors_1.AppError("Start date must be before or equal to end date", 400, "INVALID_DATE_RANGE");
    }
    // Check mess existence
    const mess = yield mess_schema_1.default.findOne({
        _id: messId,
        isDeleted: false,
        status: "active",
    });
    if (!mess) {
        throw new errors_1.AppError("Mess not found or inactive", 404, "MESS_NOT_FOUND");
    }
    // Check user membership
    const user = yield user_schema_1.default.findOne({
        _id: userId,
        messId,
        isApproved: true,
        isBlocked: false,
        isVerified: true,
    });
    if (!user) {
        throw new errors_1.AppError("User is not an approved member of this mess", 404, "USER_NOT_FOUND");
    }
    // Get mess settings
    const setting = yield MSetting_schema_1.default.findOne({ messId });
    if (!setting) {
        throw new errors_1.AppError("Settings not found for the mess", 404, "SETTINGS_NOT_FOUND");
    }
    // Fetch meals within the date range
    const meals = yield meal_schema_1.default.find({
        userId,
        messId,
        date: {
            $gte: (0, date_fns_1.startOfDay)(from),
            $lte: (0, date_fns_1.endOfDay)(to),
        },
    }).lean();
    const countDoc = yield meal_schema_1.default.find().countDocuments().lean();
    console.log(countDoc);
    // Map enabled meal types based on settings
    const enabledMealTypes = {
        breakfast: setting.breakfast,
        lunch: setting.lunch,
        dinner: setting.dinner,
    };
    // Process the meals data
    const result = {
        meals: [],
        totalActiveMeals: 0,
        totalInactiveMeals: 0,
    };
    meals.forEach((meal) => {
        var _a;
        const mealDetails = {
            userId: userId.toString(),
            date: meal.date,
        };
        // Process each meal type
        for (const mealType of Object.keys(enabledMealTypes)) {
            if (enabledMealTypes[mealType]) {
                const mealInfo = meal.meals.find((m) => m.type ===
                    meal_interface_1.MealType[(mealType.charAt(0).toUpperCase() +
                        mealType.slice(1))]);
                const mealCount = (_a = mealInfo === null || mealInfo === void 0 ? void 0 : mealInfo.numberOfMeals) !== null && _a !== void 0 ? _a : 0;
                mealDetails[mealType] = mealCount;
                if (mealCount > 0) {
                    result.totalActiveMeals += mealCount;
                }
                else {
                    result.totalInactiveMeals += 1;
                }
            }
        }
        result.meals.push(mealDetails);
    });
    return result;
});
exports.getMealDetailsByUserId = getMealDetailsByUserId;
