import {
  addDays,
  endOfDay,
  getDaysInMonth,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { startSession, Types } from "mongoose";
import { getNextMonthDetails } from "../../lib/utils";
import { AppError } from "../../middlewares/errors";
import ActivityLogModel from "../Activity/activity.schema";
import MessModel from "../Mess/mess.schema";
import SettingModel from "../MSetting/MSetting.schema";
import { UserRole } from "../User/user.interface";
import UserModel from "../User/user.schema";
import { IMeal, MealType } from "./meal.interface";
import MealModel from "./meal.schema";
export interface IMealDetailsByUserIdReturnType {
  meals: {
    breakfast?: number;
    lunch?: number;
    dinner?: number;
    userId: string;
    date: Date;
  }[];
  totalActiveMeals: number;
  totalInactiveMeals: number;
}

export interface IMealDetailsInputByUserId {
  from: Date;
  to: Date;
  userId: Types.ObjectId;
  messId: Types.ObjectId;
}
// Interface for meal creation/update input
interface MealInput {
  userId: string;
  messId: string;
  date: Date;
  meals: { type: MealType; isActive: boolean; numberOfMeals: number }[];
}

// Interface for date range meal toggle input
interface ToggleMealInput {
  userId: Types.ObjectId;
  messId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  meals: { type: MealType; isActive: boolean; numberOfMeals: number }[];
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
      // .populate("userId", "name email")
      // .populate("messId", "name messId")
      .limit(filters.limit || 100)
      .skip(filters.skip || 0)
      .sort({ date: -1 })
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
        userId: user._id as Types.ObjectId,
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

    // Fetch settings for the mess
    const setting = await SettingModel.findOne({ messId }).session(session);
    if (!setting) {
      throw new AppError(
        "Settings not found for mess",
        404,
        "SETTINGS_NOT_FOUND"
      );
    }

    // Validate meal types against mess settings
    const enabledMealTypes: { [key in MealType]?: boolean } = {
      [MealType.Breakfast]: setting.breakfast,
      [MealType.Lunch]: setting.lunch,
      [MealType.Dinner]: setting.dinner,
    };

    const invalidMealTypes = meals.filter(
      (meal) => !enabledMealTypes[meal.type]
    );
    if (invalidMealTypes.length > 0) {
      const invalidTypes = invalidMealTypes.map((m) => m.type).join(", ");
      throw new AppError(
        `Meal types [${invalidTypes}] are not enabled`,
        400,
        "INVALID_MEAL_TYPES"
      );
    }

    // Validate user and mess existence
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(messId)) {
      throw new AppError("Invalid user or mess ID", 400, "INVALID_ID");
    }

    const mess = await MessModel.findById(messId).session(session);
    if (!mess) throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");

    const user = await UserModel.findOne({
      _id: userId,
      messId,
      isApproved: true,
    }).session(session);
    if (!user)
      throw new AppError(
        "User is not an approved member",
        403,
        "NOT_MESS_MEMBER"
      );

    // Validate date range
    const start = parseISO(new Date(startDate).toISOString());
    const end = parseISO(new Date(endDate).toISOString());
    if (isAfter(start, end)) {
      throw new AppError(
        "Start date must be before end date",
        400,
        "INVALID_DATE_RANGE"
      );
    }

    // Prevent toggling for past dates
    const todayMidnight = startOfDay(new Date());
    if (isBefore(start, todayMidnight)) {
      throw new AppError(
        "Cannot toggle meals for past dates",
        400,
        "INVALID_DATE"
      );
    }

    const updatedMeals: IMeal[] = [];
    let currentDate = start;

    // Iterate through the date range
    while (!isAfter(currentDate, end)) {
      const date = startOfDay(currentDate);

      const meal = await MealModel.findOne({ userId, messId, date }).session(
        session
      );

      if (meal) {
        // Update meals array for the existing meal document
        meal.meals = meals;
        await meal.save({ session });
        updatedMeals.push(meal);
      } else {
        console.log(
          `No existing meal for user ${userId} on ${date}. Skipping.`
        );
      }

      currentDate = addDays(currentDate, 1);
    }

    await session.commitTransaction();
    console.log("HIT toggleMealsForDateRange");
    console.log("updatedMeals", updatedMeals);
    return updatedMeals;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const createMealsForOneMonth = async (messId: Types.ObjectId) => {
  try {
    console.log(`Running meal creation cron job for mess ${messId}`);

    // Validate messId
    if (!Types.ObjectId.isValid(messId)) {
      throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }

    // Fetch the mess settings
    const settings = await SettingModel.findOne({ messId }).lean();
    if (!settings) {
      throw new AppError(
        `No settings found for mess ${messId}. Please configure settings first.`,
        404,
        "SETTINGS_NOT_FOUND"
      );
    }

    // Fetch the specified mess
    const mess = await MessModel.findOne({
      _id: messId,
      isDeleted: false,
      status: "active",
    });

    if (!mess) {
      throw new AppError(
        `Mess with ID ${messId} not found or inactive.`,
        404,
        "MESS_NOT_FOUND"
      );
    }

    const currentMonth = startOfMonth(new Date());
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);

    // Check if meals are already created for the current month
    const existingMeals = await MealModel.exists({
      messId: mess._id,
      date: {
        $gte: new Date(year, month, 1),
        $lte: new Date(year, month, daysInMonth),
      },
    });

    if (existingMeals) {
      throw new AppError(
        `Meals already exist for mess ${mess._id} for the current month.`,
        400,
        "MEALS_ALREADY_EXIST"
      );
    }

    // Fetch all approved users for the mess
    const users = await UserModel.find({
      messId: mess._id,
      isApproved: true,
      isBlocked: false,
      isVerified: true,
    });

    if (users.length === 0) {
      console.log(`No users found for mess ${mess._id}.`);
      return;
    }

    const bulkOps: {
      insertOne: {
        document: {
          userId: Types.ObjectId;
          messId: Types.ObjectId;
          date: Date;
          meals: {
            type: MealType;
            isActive: boolean;
            numberOfMeals: number;
          }[];
        };
      };
    }[] = [];

    // Generate meal entries for each user for each day of the month
    for (const user of users) {
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);

        // Build meals array based on settings
        const meals = [];
        if (settings.breakfast) {
          meals.push({
            type: MealType.Breakfast,
            isActive: true,
            numberOfMeals: 0,
          });
        }
        if (settings.lunch) {
          meals.push({
            type: MealType.Lunch,
            isActive: true,
            numberOfMeals: 0,
          });
        }
        if (settings.dinner) {
          meals.push({
            type: MealType.Dinner,
            isActive: true,
            numberOfMeals: 0,
          });
        }

        // Push the document to bulk operations if meals are defined
        if (meals.length > 0) {
          bulkOps.push({
            insertOne: {
              document: {
                userId: user._id as Types.ObjectId,
                messId: mess._id as Types.ObjectId,
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
      await MealModel.bulkWrite(bulkOps, { ordered: false });
      console.log(
        `Created meals for mess ${mess._id} for ${users.length} users based on settings.`
      );
    } else {
      console.log(`No meals to create for mess ${mess._id}.`);
    }
  } catch (err) {
    throw err;
  }
};
export const createMonthlyMealsForUser = async (
  messId: Types.ObjectId,
  userId: Types.ObjectId
) => {
  const session = await startSession();

  try {
    session.startTransaction();

    // Validate messId
    const settings = await SettingModel.findOne({ messId }).session(session);
    if (!settings) {
      throw new AppError(
        "Settings not found for mess",
        404,
        "SETTINGS_NOT_FOUND"
      );
    }
    console.log(`Running meal creation for mess ${messId} and user ${userId}`);

    // Validate messId and userId
    if (!Types.ObjectId.isValid(messId)) {
      throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }

    // Fetch the specified mess
    const mess = await MessModel.findOne({
      _id: messId,
      isDeleted: false,
      status: "active",
    }).session(session);
    if (!mess) {
      throw new AppError(
        `Mess with ID ${messId} not found or inactive`,
        404,
        "MESS_NOT_FOUND"
      );
    }

    // Fetch the specified user
    const user = await UserModel.findOne({
      _id: userId,
      messId: mess._id,
      isApproved: true,
      isBlocked: false,
      isVerified: true,
    }).session(session);
    if (!user) {
      throw new AppError(
        `User with ID ${userId} not found, not approved, or does not belong to mess ${messId}`,
        404,
        "USER_NOT_FOUND"
      );
    }

    const currentMonth = startOfMonth(new Date());
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);

    // Check if meals are already created for the user for the current month
    const existingMeals = await MealModel.exists({
      messId: mess._id,
      userId: user._id,
      date: {
        $gte: new Date(year, month, 1),
        $lte: new Date(year, month, daysInMonth),
      },
    }).session(session);

    if (existingMeals) {
      throw new AppError(
        `Meals already exist for user ${user._id} in mess ${mess._id} for the current month`,
        400,
        "MEALS_ALREADY_EXIST"
      );
    }

    const bulkOps: ({
      insertOne: {
        document: {
          userId: Types.ObjectId;
          messId: Types.ObjectId;
          date: Date;
          meals: {
            type: MealType;
            isActive: boolean;
            numberOfMeals: number;
          }[];
        };
      };
    } | null)[] = [];
    console.log("settings", settings);
    // Generate meal entries for the user for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      // Create meals array based on settings
      const meals = [];
      if (settings.breakfast) {
        meals.push({
          type: MealType.Breakfast,
          isActive: true,
          numberOfMeals: 0,
        });
      }
      if (settings.lunch) {
        meals.push({ type: MealType.Lunch, isActive: true, numberOfMeals: 0 });
      }
      if (settings.dinner) {
        meals.push({ type: MealType.Dinner, isActive: true, numberOfMeals: 0 });
      }

      // Only push to bulkOps if there are meals to create
      if (meals.length > 0) {
        bulkOps.push({
          insertOne: {
            document: {
              userId: user._id as Types.ObjectId,
              messId: mess._id as Types.ObjectId,
              date,
              meals,
            },
          },
        });
      }
    }

    // Filter out null values from bulkOps
    const validBulkOps = bulkOps.filter((op) => op !== null) as Exclude<
      (typeof bulkOps)[number],
      null
    >[];

    // Execute bulk write
    if (validBulkOps.length > 0) {
      await MealModel.bulkWrite(validBulkOps, { ordered: false, session });
      console.log(
        `Created meals for user ${user._id} in mess ${mess._id} for the current month`
      );
    } else {
      console.log(
        `No meals created for user ${user._id} as all meal types are disabled in settings`
      );
    }

    await session.commitTransaction();
    return { message: `Meals created successfully for user ${user._id}` };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const getMealDetailsByUserId = async (
  input: IMealDetailsInputByUserId
): Promise<IMealDetailsByUserIdReturnType> => {
  const { from, to, userId, messId } = input;

  // Validate input
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(messId)) {
    throw new AppError("Invalid user or mess ID", 400, "INVALID_ID");
  }

  if (!isValid(from) || !isValid(to)) {
    throw new AppError("Invalid date format", 400, "INVALID_DATE");
  }

  if (isAfter(from, to)) {
    throw new AppError(
      "Start date must be before or equal to end date",
      400,
      "INVALID_DATE_RANGE"
    );
  }

  // Check mess existence
  const mess = await MessModel.findOne({
    _id: messId,
    isDeleted: false,
    status: "active",
  });
  if (!mess) {
    throw new AppError("Mess not found or inactive", 404, "MESS_NOT_FOUND");
  }

  // Check user membership
  const user = await UserModel.findOne({
    _id: userId,
    messId,
    isApproved: true,
    isBlocked: false,
    isVerified: true,
  });
  if (!user) {
    throw new AppError(
      "User is not an approved member of this mess",
      404,
      "USER_NOT_FOUND"
    );
  }

  // Get mess settings
  const setting = await SettingModel.findOne({ messId });
  if (!setting) {
    throw new AppError(
      "Settings not found for the mess",
      404,
      "SETTINGS_NOT_FOUND"
    );
  }

  // Fetch meals within the date range
  const meals = await MealModel.find({
    userId,
    messId,
    date: {
      $gte: startOfDay(from),
      $lte: endOfDay(to),
    },
  }).lean();
  const countDoc = await MealModel.find().countDocuments().lean();
  console.log(countDoc);
  // Map enabled meal types based on settings
  const enabledMealTypes = {
    breakfast: setting.breakfast,
    lunch: setting.lunch,
    dinner: setting.dinner,
  };

  // Process the meals data
  const result: IMealDetailsByUserIdReturnType = {
    meals: [],
    totalActiveMeals: 0,
    totalInactiveMeals: 0,
  };

  meals.forEach((meal) => {
    const mealDetails: IMealDetailsByUserIdReturnType["meals"][number] = {
      userId: userId.toString(),
      date: meal.date,
    };

    // Process each meal type
    for (const mealType of Object.keys(enabledMealTypes) as Array<
      keyof typeof enabledMealTypes
    >) {
      if (enabledMealTypes[mealType]) {
        const mealInfo = meal.meals.find(
          (m) =>
            m.type ===
            MealType[
              (mealType.charAt(0).toUpperCase() +
                mealType.slice(1)) as keyof typeof MealType
            ]
        );
        const mealCount = mealInfo?.numberOfMeals ?? 0;
        mealDetails[mealType] = mealCount;

        if (mealCount > 0) {
          result.totalActiveMeals += mealCount;
        } else {
          result.totalInactiveMeals += 1;
        }
      }
    }

    result.meals.push(mealDetails);
  });

  return result;
};
