import { PipelineStage, startSession, Types } from "mongoose";
import { IStatus } from "../../interfaces/global.interface";
import { AppError } from "../../middlewares/errors";
import { ExpenseCategory } from "../Expense/expense.interface";
import ExpenseModel from "../Expense/expense.schema";
import { MealType } from "../Meal/meal.interface";
import MealModel from "../Meal/meal.schema";
import MessModel from "../Mess/mess.schema";
import SettingModel from "../MSetting/MSetting.schema";
import { UserRole } from "../User/user.interface";
import UserModel from "../User/user.schema";
import {
  IGroceryReport,
  IUsersMeal,
  MealReportFilters,
  MealReportResult,
  UsersMealFilters,
} from "./report.interface";

export const generateMealReport = async (
  filters: MealReportFilters,
  authUserId: string
): Promise<MealReportResult> => {
  const session = await startSession();
  try {
    if (!filters) {
      throw new AppError("Filters object is required", 400, "MISSING_FILTERS");
    }

    if (!Types.ObjectId.isValid(authUserId)) {
      throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }

    if (filters.messId && !Types.ObjectId.isValid(filters.messId)) {
      throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }

    const setting = await SettingModel.findOne({
      messId: filters.messId,
    }).session(session);

    if (!setting) {
      throw new AppError("Setting not found", 404, "SETTING_NOT_FOUND");
    }

    const enabledMeals = {
      breakfast: setting.breakfast,
      lunch: setting.lunch,
      dinner: setting.dinner,
    };

    const user = await UserModel.findById(authUserId);
    if (!user || !user.isApproved) {
      throw new AppError("User is not approved", 403, "NOT_APPROVED");
    }

    if (
      filters.messId &&
      (!user.messId || !user.messId.equals(filters.messId))
    ) {
      throw new AppError(
        "User is not a member of this mess",
        403,
        "NOT_MESS_MEMBER"
      );
    }

    const mealMatch: any = {};
    if (filters.messId) mealMatch.messId = new Types.ObjectId(filters.messId);
    if (filters.userId) mealMatch.userId = new Types.ObjectId(filters.userId);
    if (filters.dateFrom || filters.dateTo) {
      mealMatch.date = {};
      if (filters.dateFrom) mealMatch.date.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) mealMatch.date.$lte = new Date(filters.dateTo);
    }

    const mealTypeMap: Record<string, MealType> = {
      breakfast: MealType.Breakfast,
      lunch: MealType.Lunch,
      dinner: MealType.Dinner,
    };

    // Array of enabled meal types
    const enabledMealTypes = Object.keys(enabledMeals)
      .filter((type) => enabledMeals[type as keyof typeof enabledMeals])
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
        $group: {
          _id: null, // Group all into a single document
          totalMeals: { $sum: "$meals.numberOfMeals" },
          totalActiveMeals: {
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
          },
          ...Object.keys(enabledMeals).reduce((acc, type) => {
            if (enabledMeals[type as keyof typeof enabledMeals]) {
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
          }, {} as Record<string, any>),
          messId: { $first: "$messId" },
          userId: filters.userId ? { $first: "$userId" } : { $first: null },
        },
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
        $project: {
          _id: {
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
          },
          totalMeals: 1,
          totalActiveMeals: 1,
          ...Object.keys(enabledMeals).reduce((acc, type) => {
            if (enabledMeals[type as keyof typeof enabledMeals]) {
              acc[type] = {
                active: `$${type}Active`,
                inactive: `$${type}Inactive`,
                total: { $add: [`$${type}Active`, `$${type}Inactive`] },
              };
            }
            return acc;
          }, {} as Record<string, any>),
        },
      },
    ];

    const expenseMatch: any = {
      messId: filters.messId,
      category: ExpenseCategory.Grocery,
      status: IStatus.Approved,
    };

    if (filters.dateFrom || filters.dateTo) {
      expenseMatch.date = {};
      if (filters.dateFrom) expenseMatch.date.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) expenseMatch.date.$lte = new Date(filters.dateTo);
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

    const [mealResults, expenseResults] = await Promise.all([
      MealModel.aggregate(mealPipeline).session(session),
      ExpenseModel.aggregate(expensePipeline).session(session),
    ]);

    const totalApprovedExpense =
      expenseResults.length > 0 ? expenseResults[0].totalApprovedExpense : 0;

    const mealItem = mealResults[0] || {
      totalMeals: 0,
      totalActiveMeals: 0,
      breakfast: null,
      lunch: null,
      dinner: null,
      _id: { mess: null, user: null, date: null },
    };

    const totalActiveMeals = mealItem.totalActiveMeals || 0;
    const perMealRate =
      totalActiveMeals > 0 ? totalApprovedExpense / totalActiveMeals : 0;

    const report: MealReportResult = {
      _id: mealItem._id,
      totalMeals: mealItem.totalMeals || 0,
      totalActiveMeals: totalActiveMeals,
      totalCost: totalApprovedExpense,
      perMealRate,
      breakfast:
        enabledMeals.breakfast && mealItem.breakfast
          ? {
              active: mealItem.breakfast.active || 0,
              inactive: mealItem.breakfast.inactive || 0,
              total: mealItem.breakfast.total || 0,
            }
          : undefined,
      lunch:
        enabledMeals.lunch && mealItem.lunch
          ? {
              active: mealItem.lunch.active || 0,
              inactive: mealItem.lunch.inactive || 0,
              total: mealItem.lunch.total || 0,
            }
          : undefined,
      dinner:
        enabledMeals.dinner && mealItem.dinner
          ? {
              active: mealItem.dinner.active || 0,
              inactive: mealItem.dinner.inactive || 0,
              total: mealItem.dinner.total || 0,
            }
          : undefined,
    };

    return report;
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};
export const generateUsersMealReport = async (
  filters: UsersMealFilters,
  authUserId: string
): Promise<IUsersMeal[]> => {
  if (!filters) {
    throw new AppError("Filters object is required", 400, "MISSING_FILTERS");
  }

  if (!Types.ObjectId.isValid(authUserId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  if (filters.messId && !Types.ObjectId.isValid(filters.messId)) {
    throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
  }

  const user = await UserModel.findById(authUserId);
  if (!user || !user.isApproved) {
    throw new AppError("User is not approved", 403, "NOT_APPROVED");
  }

  // Restrict to user's mess unless Admin/Manager
  const isAdminOrManager = [UserRole.Admin, UserRole.Manager].includes(
    user.role
  );
  if (
    // !isAdminOrManager &&
    filters.messId &&
    (!user.messId || !user.messId.equals(filters.messId))
  ) {
    throw new AppError(
      "User is not a member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  // Match stage for meals
  const mealMatch: any = {
    userId: { $exists: true },
  };
  if (filters.messId) mealMatch.messId = new Types.ObjectId(filters.messId);
  if (filters.dateFrom || filters.dateTo) {
    mealMatch.date = {};
    if (filters.dateFrom) mealMatch.date.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) mealMatch.date.$lte = new Date(filters.dateTo);
  }

  // Match stage for expenses
  const expenseMatch: any = {
    category: ExpenseCategory.Grocery,
    status: IStatus.Approved,
    isDeleted: false,
  };
  if (filters.messId) expenseMatch.messId = new Types.ObjectId(filters.messId);
  if (filters.dateFrom || filters.dateTo) {
    expenseMatch.date = {};
    if (filters.dateFrom) expenseMatch.date.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) expenseMatch.date.$lte = new Date(filters.dateTo);
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

  const [mealResults, expenseResults] = await Promise.all([
    MealModel.aggregate(mealPipeline),
    ExpenseModel.aggregate(expensePipeline),
  ]);

  // Merge meal and expense data
  const report = await Promise.all(
    mealResults.map(async (mealItem) => {
      const expenseItem = expenseResults.find(
        (exp) => exp._id?.toString() === mealItem._id?.toString()
      );

      const user = await UserModel.findById(mealItem._id).select("name");
      if (!user) {
        return null; // Skip if user not found
      }

      return {
        _id: mealItem._id.toString(),
        name: user.name,
        totalMeals: mealItem.totalMeals || 0,
        totalActiveMeals: mealItem.totalActiveMeals || 0,
        totalCost: expenseItem?.totalCost || 0,
      };
    })
  );

  // Filter out null entries and sort by name
  return report
    .filter((item): item is IUsersMeal => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(filters.skip || 0, (filters.skip || 0) + (filters.limit || 100));
};
export const generateGroceryReport = async (
  filters: {
    messId?: string;
    from?: string;
    to?: string;
  },
  authUserId: string
): Promise<IGroceryReport[]> => {
  const session = await startSession();
  try {
    if (!filters) {
      throw new AppError("Filters object is required", 400, "MISSING_FILTERS");
    }

    if (!Types.ObjectId.isValid(authUserId)) {
      throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }

    if (filters.messId && !Types.ObjectId.isValid(filters.messId)) {
      throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }

    const user = await UserModel.findById(authUserId).session(session);
    if (!user || !user.isApproved) {
      throw new AppError("User is not approved", 403, "NOT_APPROVED");
    }

    if (
      filters.messId &&
      (!user.messId || !user.messId.equals(filters.messId))
    ) {
      throw new AppError(
        "User is not a member of this mess",
        403,
        "NOT_MESS_MEMBER"
      );
    }

    const expenseMatch: any = {
      messId: filters.messId ? new Types.ObjectId(filters.messId) : undefined,
      category: ExpenseCategory.Grocery,
      status: IStatus.Approved,
      isDeleted: false,
    };

    if (filters.from || filters.to) {
      expenseMatch.date = {};
      if (filters.from) expenseMatch.date.$gte = new Date(filters.from);
      if (filters.to) expenseMatch.date.$lte = new Date(filters.to);
    }

    const pipeline: PipelineStage[] = [
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

    const results = await ExpenseModel.aggregate(pipeline).session(session);

    const report: IGroceryReport[] = results.map((item) => ({
      name: item.name,
      unit: item.unit,
      total: item.total,
      price: item.price,
      quantity: item.quantity,
    }));

    return report;
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};
