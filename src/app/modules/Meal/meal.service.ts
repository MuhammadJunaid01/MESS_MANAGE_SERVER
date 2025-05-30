import { Types } from "mongoose";
import { AppError } from "../../middlewares/errors";
import MessModel from "../Mess/mess.schema";
import { UserRole } from "../User/user.interface";
import UserModel from "../User/user.model";
import { IMeal, MealType } from "./meal.interface";
import MealModel from "./meal.schema";

// Interface for meal creation/update input
interface MealInput {
  userId: string;
  messId: string;
  date: Date;
  meals: { type: MealType; isActive: boolean }[];
}

// Interface for date range meal toggle input
interface ToggleMealInput {
  userId: string;
  messId: string;
  startDate: Date;
  endDate: Date;
  meals: { type: MealType; isActive: boolean }[];
}

// Create a new meal
export const createMeal = async (input: MealInput): Promise<IMeal> => {
  const { userId, messId, date, meals } = input;

  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(messId)) {
    throw new AppError("Invalid user or mess ID", 400, "INVALID_ID");
  }

  const mess = await MessModel.findById(messId);
  if (!mess) {
    throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: userId,
    messId,
    isApproved: true,
  });
  if (!user) {
    throw new AppError(
      "User is not an approved member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  const mealDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (mealDate.getTime() < today.getTime()) {
    throw new AppError(
      "Cannot create meal for past dates",
      400,
      "INVALID_DATE"
    );
  }

  const existingMeal = await MealModel.findOne({
    userId,
    messId,
    date: mealDate,
  });
  if (existingMeal) {
    throw new AppError(
      "Meal already exists for this user on this date",
      400,
      "MEAL_EXISTS"
    );
  }

  const validMealTypes = Object.values(MealType);
  if (!meals.every((meal) => validMealTypes.includes(meal.type))) {
    throw new AppError("Invalid meal type", 400, "INVALID_MEAL_TYPE");
  }

  const meal = await MealModel.create({
    userId: new Types.ObjectId(userId),
    messId: new Types.ObjectId(messId),
    date: mealDate,
    meals,
  });

  return meal;
};

// Get meal by ID
export const getMealById = async (
  mealId: string,
  userId: string
): Promise<IMeal> => {
  if (!Types.ObjectId.isValid(mealId) || !Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid meal or user ID", 400, "INVALID_ID");
  }

  const meal = await MealModel.findById(mealId)
    .populate("userId", "name email")
    .populate("messId", "name messId");
  if (!meal) {
    throw new AppError("Meal not found", 404, "MEAL_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: userId,
    messId: meal.messId,
    isApproved: true,
  });
  if (!user) {
    throw new AppError(
      "User is not an approved member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  return meal;
};

// Get meals with filters
export const getMeals = async (
  filters: {
    messId?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    skip?: number;
  },
  userId: string
): Promise<IMeal[]> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  if (filters.messId && !Types.ObjectId.isValid(filters.messId)) {
    throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
  }

  if (filters.userId && !Types.ObjectId.isValid(filters.userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  const user = await UserModel.findOne({
    _id: userId,
    ...(filters.messId ? { messId: filters.messId } : {}),
    isApproved: true,
  });
  if (!user) {
    throw new AppError(
      "User is not an approved member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  const query: any = {};
  if (filters.messId) query.messId = new Types.ObjectId(filters.messId);
  if (filters.userId) query.userId = new Types.ObjectId(filters.userId);
  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) query.date.$gte = filters.dateFrom;
    if (filters.dateTo) query.date.$lte = filters.dateTo;
  }

  return MealModel.find(query)
    .populate("userId", "name email")
    .populate("messId", "name messId")
    .limit(filters.limit || 100)
    .skip(filters.skip || 0)
    .sort({ date: 1 });
};

// Update meal
export const updateMeal = async (
  mealId: string,
  input: Partial<MealInput>
): Promise<IMeal> => {
  if (!Types.ObjectId.isValid(mealId)) {
    throw new AppError("Invalid meal ID", 400, "INVALID_ID");
  }

  const meal = await MealModel.findById(mealId);
  if (!meal) {
    throw new AppError("Meal not found", 404, "MEAL_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: input.userId || meal.userId,
    messId: meal.messId,
    isApproved: true,
  });
  if (!user) {
    throw new AppError(
      "User is not an approved member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  const updateData: Partial<IMeal> = {};
  if (input.meals) {
    const validMealTypes = Object.values(MealType);
    if (!input.meals.every((m) => validMealTypes.includes(m.type))) {
      throw new AppError("Invalid meal type", 400, "INVALID_MEAL_TYPE");
    }
    updateData.meals = input.meals;
  }
  if (input.date) {
    const mealDate = new Date(input.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (mealDate.getTime() < today.getTime()) {
      throw new AppError(
        "Cannot update meal to past dates",
        400,
        "INVALID_DATE"
      );
    }
    updateData.date = mealDate;
  }

  Object.assign(meal, updateData);
  await meal.save();
  return meal;
};

// Delete meal
export const deleteMeal = async (
  mealId: string,
  userId: string
): Promise<void> => {
  if (!Types.ObjectId.isValid(mealId) || !Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid meal or user ID", 400, "INVALID_ID");
  }

  const meal = await MealModel.findById(mealId);
  if (!meal) {
    throw new AppError("Meal not found", 404, "MEAL_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: userId,
    messId: meal.messId,
    isVerified: true,
  });
  if (!user || ![UserRole.Admin, UserRole.Manager].includes(user.role)) {
    throw new AppError(
      "Only admins or managers can delete meals",
      403,
      "FORBIDDEN"
    );
  }

  await meal.deleteOne();
};

// Toggle meals for date range
export const toggleMealsForDateRange = async (
  input: ToggleMealInput
): Promise<IMeal[]> => {
  const { userId, messId, startDate, endDate, meals } = input;

  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(messId)) {
    throw new AppError("Invalid user or mess ID", 400, "INVALID_ID");
  }

  const mess = await MessModel.findById(messId);
  if (!mess) {
    throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: userId,
    messId,
    isApproved: true,
  });
  if (!user) {
    throw new AppError(
      "User is not an approved member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > end) {
    throw new AppError(
      "Start date must be before end date",
      400,
      "INVALID_DATE_RANGE"
    );
  }
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  if (start.getTime() < todayMidnight.getTime()) {
    throw new AppError(
      "Cannot toggle meals for past dates",
      400,
      "INVALID_DATE"
    );
  }

  const validMealTypes = Object.values(MealType);
  if (!meals.every((m) => validMealTypes.includes(m.type))) {
    throw new AppError("Invalid meal type", 400, "INVALID_MEAL_TYPE");
  }

  const updatedMeals: IMeal[] = [];
  let currentDate = new Date(start);

  while (currentDate <= end) {
    const date = new Date(currentDate);
    let meal = await MealModel.findOne({ userId, messId, date });

    if (meal) {
      meal.meals = meals;
      await meal.save();
      updatedMeals.push(meal);
    } else {
      const newMeal = await MealModel.create({
        userId: new Types.ObjectId(userId),
        messId: new Types.ObjectId(messId),
        date,
        meals,
      });
      updatedMeals.push(newMeal);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return updatedMeals;
};
