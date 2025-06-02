import { Types } from "mongoose";
import { IStatus } from "../../interfaces/global.interface";
import { AppError } from "../../middlewares/errors";
import { ExpenseCategory } from "../Expense/expense.interface";
import ExpenseModel from "../Expense/expense.schema";
import { MealType } from "../Meal/meal.interface";
import MealModel from "../Meal/meal.schema";
import MessModel from "../Mess/mess.schema";
import { UserRole } from "../User/user.interface";
import UserModel from "../User/user.model";
import {
  IUsersMeal,
  MealReportFilters,
  MealReportResult,
  UsersMealFilters,
} from "./report.interface";

export const generateMealReport = async (
  filters: MealReportFilters,
  authUserId: string
): Promise<MealReportResult[]> => {
  if (!filters) {
    throw new AppError("Filters object is required", 400, "MISSING_FILTERS");
  }

  if (!Types.ObjectId.isValid(authUserId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  if (filters.messId && !Types.ObjectId.isValid(filters.messId)) {
    throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
  }

  if (filters.userId && !Types.ObjectId.isValid(filters.userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  const user = await UserModel.findById(authUserId);
  if (!user || !user.isApproved) {
    throw new AppError("User is not approved", 403, "NOT_APPROVED");
  }

  // Restrict to user's mess unless Admin/Manager
  // const isAdminOrManager = [UserRole.Admin, UserRole.Manager].includes(
  //   user.role
  // );
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
  const mealMatch: any = {};
  if (filters.messId) mealMatch.messId = new Types.ObjectId(filters.messId);
  if (filters.userId) mealMatch.userId = new Types.ObjectId(filters.userId);
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

  const groupByField = filters.groupBy || "mess";
  const groupId: any = {};
  if (groupByField === "mess") groupId.messId = "$messId";
  if (groupByField === "user") groupId.userId = "$userId";
  if (groupByField === "date")
    groupId.date = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };

  // Aggregate meals
  const mealPipeline = [
    { $match: mealMatch },
    { $unwind: "$meals" },
    {
      $group: {
        _id: groupId,
        totalMeals: { $sum: "$meals.numberOfMeals" },
        totalInactiveMeals: {
          $sum: {
            $cond: [{ $eq: ["$meals.numberOfMeals", 0] }, 1, 0],
          },
        },
        breakfastActive: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$meals.type", MealType.Breakfast] },
                  { $eq: ["$meals.isActive", true] },
                ],
              },
              "$meals.numberOfMeals",
              0,
            ],
          },
        },
        breakfastInactive: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$meals.type", MealType.Breakfast] },
                  { $eq: ["$meals.isActive", false] },
                ],
              },
              "$meals.numberOfMeals",
              0,
            ],
          },
        },
        lunchActive: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$meals.type", MealType.Lunch] },
                  { $eq: ["$meals.isActive", true] },
                ],
              },
              "$meals.numberOfMeals",
              0,
            ],
          },
        },
        lunchInactive: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$meals.type", MealType.Lunch] },
                  { $eq: ["$meals.isActive", false] },
                ],
              },
              "$meals.numberOfMeals",
              0,
            ],
          },
        },
        dinnerActive: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$meals.type", MealType.Dinner] },
                  { $eq: ["$meals.isActive", true] },
                ],
              },
              "$meals.numberOfMeals",
              0,
            ],
          },
        },
        dinnerInactive: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$meals.type", MealType.Dinner] },
                  { $eq: ["$meals.isActive", false] },
                ],
              },
              "$meals.numberOfMeals",
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
        _id:
          groupByField === "mess"
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

  const [mealResults, expenseResults] = await Promise.all([
    MealModel.aggregate(mealPipeline),
    ExpenseModel.aggregate(expensePipeline),
  ]);

  // Merge meal and expense data
  const report = mealResults.map((mealItem) => {
    const expenseItem = expenseResults.find((exp) => {
      if (groupByField === "mess")
        return exp._id.messId?.toString() === mealItem._id.messId?.toString();
      if (groupByField === "user")
        return (
          exp._id.createdBy?.toString() === mealItem._id.userId?.toString()
        );
      if (groupByField === "date") return exp._id.date === mealItem._id.date;
      return false;
    });

    const totalCost = expenseItem?.totalCost || 0;
    const totalMeals = mealItem.totalMeals || 0;
    const perMealRate = totalMeals > 0 ? totalCost / totalMeals : 0;

    return {
      _id: mealItem._id,
      totalMeals,
      totalInactiveMeals: mealItem.totalInactiveMeals || 0,
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
  const populatedReport = await Promise.all(
    report.map(async (item) => {
      const result: any = { ...item };
      if (item._id.messId) {
        const mess = await MessModel.findById(item._id.messId).select(
          "name messId"
        );
        result._id.mess = mess
          ? { _id: mess._id, name: mess.name, messId: mess.messId }
          : null;
        delete result._id.messId;
      }
      if (item._id.userId) {
        const user = await UserModel.findById(item._id.userId).select(
          "name email"
        );
        result._id.user = user
          ? { _id: user._id, name: user.name, email: user.email }
          : null;
        delete result._id.userId;
      }
      return result;
    })
  );

  return populatedReport
    .sort((a, b) =>
      (a._id.mess?.name || a._id.user?.name || a._id.date || "").localeCompare(
        b._id.mess?.name || b._id.user?.name || b._id.date || ""
      )
    )
    .slice(filters.skip || 0, (filters.skip || 0) + (filters.limit || 100));
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
