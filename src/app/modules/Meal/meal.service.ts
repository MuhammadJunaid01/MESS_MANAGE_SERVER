import { isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { startSession, Types } from "mongoose";
import { AppError } from "../../middlewares/errors";
import ActivityLogModel from "../Activity/activity.schema";
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
  const session = await startSession();

  try {
    session.startTransaction();

    // Validate IDs
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(messId)) {
      throw new AppError("Invalid user or mess ID", 400, "INVALID_ID");
    }

    // Check if the mess exists
    const mess = await MessModel.findById(messId).session(session);
    if (!mess) {
      throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
    }

    // Check if the user is approved and belongs to the mess
    const user = await UserModel.findOne({
      _id: userId,
      messId,
      isApproved: true,
    }).session(session);
    if (!user) {
      throw new AppError(
        "User is not an approved member of this mess",
        403,
        "NOT_MESS_MEMBER"
      );
    }

    // Validate date
    const mealDate = startOfDay(new Date(date));
    const today = startOfDay(new Date());
    if (isBefore(mealDate, today)) {
      throw new AppError(
        "Cannot create meal for past dates",
        400,
        "INVALID_DATE"
      );
    }

    // Check for existing meal
    const existingMeal = await MealModel.findOne({
      userId,
      messId,
      date: mealDate,
    }).session(session);
    if (existingMeal) {
      throw new AppError(
        "Meal already exists for this user on this date",
        400,
        "MEAL_EXISTS"
      );
    }

    // Validate meal types
    const validMealTypes = Object.values(MealType);
    if (!meals.every((meal) => validMealTypes.includes(meal.type))) {
      throw new AppError("Invalid meal type", 400, "INVALID_MEAL_TYPE");
    }

    // Create and save the meal
    const meal = new MealModel({
      userId: new Types.ObjectId(userId),
      messId: new Types.ObjectId(messId),
      date: mealDate,
      meals,
    });
    const savedMeal = await meal.save({ session });

    // Log activity
    const activity = new ActivityLogModel({
      messId: new Types.ObjectId(messId),
      entity: "Meal",
      entityId: savedMeal._id,
      action: "create",
      performedBy: {
        userId: new Types.ObjectId(userId),
        name: user.name,
      },
    });
    await activity.save({ session });

    await session.commitTransaction();
    return savedMeal;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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
  const session = await startSession();

  try {
    session.startTransaction();

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
    }).session(session);

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

    const meals = await MealModel.find(query)
      .populate("userId", "name email")
      .populate("messId", "name messId")
      .limit(filters.limit || 100)
      .skip(filters.skip || 0)
      .sort({ date: 1 })
      .session(session);

    await session.commitTransaction();

    return meals;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Update meal
export const updateMeal = async (
  mealId: string,
  input: Partial<MealInput>
): Promise<IMeal> => {
  const session = await startSession();

  try {
    session.startTransaction();

    if (!Types.ObjectId.isValid(mealId)) {
      throw new AppError("Invalid meal ID", 400, "INVALID_ID");
    }

    const meal = await MealModel.findById(mealId).session(session);
    if (!meal) {
      throw new AppError("Meal not found", 404, "MEAL_NOT_FOUND");
    }

    const user = await UserModel.findOne({
      _id: input.userId || meal.userId,
      messId: meal.messId,
      isApproved: true,
    }).session(session);

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
      const mealDate = startOfDay(parseISO(new Date(input.date).toISOString()));
      const today = startOfDay(new Date());

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
    await meal.save({ session });

    const activity = new ActivityLogModel({
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

    await activity.save({ session });
    await session.commitTransaction();

    return meal;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Delete meal
export const deleteMeal = async (
  mealId: string,
  userId: string
): Promise<void> => {
  const session = await startSession();

  try {
    session.startTransaction();

    if (!Types.ObjectId.isValid(mealId) || !Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid meal or user ID", 400, "INVALID_ID");
    }

    const meal = await MealModel.findById(mealId).session(session);
    if (!meal) {
      throw new AppError("Meal not found", 404, "MEAL_NOT_FOUND");
    }

    const user = await UserModel.findOne({
      _id: userId,
      messId: meal.messId,
      isVerified: true,
    }).session(session);

    if (!user || ![UserRole.Admin, UserRole.Manager].includes(user.role)) {
      throw new AppError(
        "Only admins or managers can delete meals",
        403,
        "FORBIDDEN"
      );
    }

    const activity = new ActivityLogModel({
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

    await activity.save({ session });
    await meal.deleteOne({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Toggle meals for date range
export const toggleMealsForDateRange = async (
  input: ToggleMealInput
): Promise<IMeal[]> => {
  const session = await startSession();

  try {
    session.startTransaction();
    const { userId, messId, startDate, endDate, meals } = input;

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(messId)) {
      throw new AppError("Invalid user or mess ID", 400, "INVALID_ID");
    }

    const mess = await MessModel.findById(messId).session(session);
    if (!mess) {
      throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
    }

    const user = await UserModel.findOne({
      _id: userId,
      messId,
      isApproved: true,
    }).session(session);

    if (!user) {
      throw new AppError(
        "User is not an approved member of this mess",
        403,
        "NOT_MESS_MEMBER"
      );
    }

    const start = parseISO(new Date(startDate).toISOString());
    const end = parseISO(new Date(endDate).toISOString());

    if (isAfter(start, end)) {
      throw new AppError(
        "Start date must be before end date",
        400,
        "INVALID_DATE_RANGE"
      );
    }

    const todayMidnight = startOfDay(new Date());
    if (isBefore(start, todayMidnight)) {
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
      let meal = await MealModel.findOne({ userId, messId, date }).session(
        session
      );

      if (meal) {
        meal.meals = meals;
        await meal.save({ session });
        updatedMeals.push(meal);
      } else {
        const newMeal = await MealModel.create(
          [
            {
              userId: new Types.ObjectId(userId),
              messId: new Types.ObjectId(messId),
              date,
              meals,
            },
          ],
          { session }
        );
        updatedMeals.push(newMeal[0]);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    await session.commitTransaction();
    return updatedMeals;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
