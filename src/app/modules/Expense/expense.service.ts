import { startSession, Types } from "mongoose";
import { IStatus } from "../../interfaces/global.interface";
import { AppError } from "../../middlewares/errors";
import ActivityLogModel from "../Activity/activity.schema";
import MessModel from "../Mess/mess.schema";
import { UserRole } from "../User/user.interface";
import UserModel from "../User/user.model";
import { ExpenseCategory, IExpense, IGroceryItem } from "./expense.interface";
import ExpenseModel from "./expense.schema";

// Interface for expense creation input
interface CreateExpenseInput {
  messId: Types.ObjectId;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: Date;
  items?: IGroceryItem[];
}

// Interface for expense update input
interface UpdateExpenseInput {
  category?: ExpenseCategory;
  amount?: number;
  description?: string;
  date?: Date;
  items?: IGroceryItem[];
}

// Interface for expense status update input
interface UpdateExpenseStatusInput {
  status: IStatus;
}

// Interface for activity log input
interface ActivityLogInput {
  action: "created" | "updated" | "approved" | "rejected" | "deleted";
  performedBy: {
    userId: string;
    name: string;
  };
}

// Create a new expense
export const createExpense = async (
  input: CreateExpenseInput,
  createdBy: { userId: Types.ObjectId; name: string }
): Promise<IExpense> => {
  const session = await startSession();
  session.startTransaction();

  try {
    const { messId, category, amount, description, date, items } = input;

    if (!Types.ObjectId.isValid(messId)) {
      throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }

    if (!Types.ObjectId.isValid(createdBy.userId)) {
      throw new AppError("Invalid creator ID", 400, "INVALID_USER_ID");
    }

    const mess = await MessModel.findById(messId).session(session);
    if (!mess || mess.isDeleted) {
      throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
    }

    const user = await UserModel.findOne({
      _id: createdBy.userId,
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

    if (items && category !== ExpenseCategory.Grocery) {
      throw new AppError(
        "Items can only be specified for Grocery expenses",
        400,
        "INVALID_ITEMS"
      );
    }

    const expense = new ExpenseModel({
      messId: new Types.ObjectId(messId),
      category,
      amount,
      description,
      date,
      items,
      createdBy: new Types.ObjectId(createdBy.userId),
    });
    const newExpense = await expense.save({ session });
    // Create activity log
    const activity = new ActivityLogModel({
      messId: messId,
      entity: "Expense",
      entityId: newExpense._id,
      action: "created",
      performedBy: {
        userId: new Types.ObjectId(createdBy.userId),
        name: createdBy.name,
      },
      timestamp: new Date(),
    });
    await activity.save({ session });
    // Commit the transaction
    await session.commitTransaction();
    return newExpense;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // Always end the session
    session.endSession();
  }
};

// Get expense by ID
export const getExpenseById = async (
  expenseId: string,
  userId: string
): Promise<IExpense> => {
  if (!Types.ObjectId.isValid(expenseId)) {
    throw new AppError("Invalid expense ID", 400, "INVALID_EXPENSE_ID");
  }

  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  const expense = await ExpenseModel.findOne({
    _id: expenseId,
    isDeleted: false,
  })
    .select("-activityLogs")
    .populate("createdBy", "name email")
    .populate("messId", "name messId");
  if (!expense) {
    throw new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: userId,
    messId: expense.messId,
    isApproved: true,
  });
  if (!user) {
    throw new AppError(
      "User is not an approved member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  return expense;
};

// Get expenses with filters
export const getExpenses = async (
  filters: {
    messId?: string;
    status?: IStatus;
    category?: ExpenseCategory;
    dateFrom?: Date;
    dateTo?: Date;
    createdBy?: string;
    limit?: number;
    skip?: number;
  },
  userId: string
): Promise<IExpense[]> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  if (filters.messId && !Types.ObjectId.isValid(filters.messId)) {
    throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
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

  const query: any = { isDeleted: false };
  if (filters.messId) query.messId = new Types.ObjectId(filters.messId);
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.createdBy && Types.ObjectId.isValid(filters.createdBy)) {
    query.createdBy = new Types.ObjectId(filters.createdBy);
  }
  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) query.date.$gte = filters.dateFrom;
    if (filters.dateTo) query.date.$lte = filters.dateTo;
  }

  return ExpenseModel.find(query)
    .select("-activityLogs")
    .populate("createdBy", "name email")
    .populate("messId", "name messId")
    .limit(filters.limit || 100)
    .skip(filters.skip || 0)
    .sort({ date: -1 });
};

// Update expense
export const updateExpense = async (
  expenseId: string,
  input: UpdateExpenseInput,
  updatedBy: { userId: string; name: string }
): Promise<IExpense> => {
  if (!Types.ObjectId.isValid(expenseId)) {
    throw new AppError("Invalid expense ID", 400, "INVALID_EXPENSE_ID");
  }

  if (!Types.ObjectId.isValid(updatedBy.userId)) {
    throw new AppError("Invalid updater ID", 400, "INVALID_USER_ID");
  }

  const expense = await ExpenseModel.findOne({
    _id: expenseId,
    isDeleted: false,
  });
  if (!expense) {
    throw new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: updatedBy.userId,
    messId: expense.messId,
    isApproved: true,
  });
  if (!user) {
    throw new AppError(
      "User is not an approved member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  if (expense.status !== IStatus.Pending) {
    throw new AppError(
      "Only pending expenses can be updated",
      400,
      "INVALID_STATUS"
    );
  }

  if (input.items && expense.category !== ExpenseCategory.Grocery) {
    throw new AppError(
      "Items can only be specified for Grocery expenses",
      400,
      "INVALID_ITEMS"
    );
  }

  const updateData: Partial<IExpense> = {};
  if (input.category) updateData.category = input.category;
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.description) updateData.description = input.description;
  if (input.date) updateData.date = input.date;
  if (input.items) updateData.items = input.items;

  await ActivityLogModel.create({
    messId: expense.messId,
    entity: "Expense",
    entityId: expenseId,
    action: "updated",
    performedBy: {
      userId: new Types.ObjectId(updatedBy.userId),
      name: updatedBy.name,
    },
    timestamp: new Date(),
  });

  await expense.save();
  return expense;
};

// Update expense status (approve/reject)
export const updateExpenseStatus = async (
  expenseId: string,
  input: UpdateExpenseStatusInput,
  performedBy: { userId: string; name: string }
): Promise<IExpense> => {
  if (!Types.ObjectId.isValid(expenseId)) {
    throw new AppError("Invalid expense ID", 400, "INVALID_EXPENSE_ID");
  }

  if (!Types.ObjectId.isValid(performedBy.userId)) {
    throw new AppError("Invalid performer ID", 400, "INVALID_USER_ID");
  }

  const expense = await ExpenseModel.findOne({
    _id: expenseId,
    isDeleted: false,
  });
  if (!expense) {
    throw new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: performedBy.userId,
    messId: expense.messId,
    isApproved: true,
  });
  if (!user || ![UserRole.Admin, UserRole.Manager].includes(user.role)) {
    throw new AppError(
      "Only admins or managers can approve/reject expenses",
      403,
      "FORBIDDEN"
    );
  }

  if (expense.status !== IStatus.Pending) {
    throw new AppError(
      "Only pending expenses can be approved/rejected",
      400,
      "INVALID_STATUS"
    );
  }

  if (![IStatus.Approved, IStatus.Rejected].includes(input.status)) {
    throw new AppError("Invalid status update", 400, "INVALID_STATUS");
  }

  await ActivityLogModel.create({
    messId: expense.messId,
    entity: "Expense",
    entityId: expenseId,
    action: input.status,
    performedBy: {
      userId: new Types.ObjectId(performedBy.userId),
      name: performedBy.name,
    },
    timestamp: new Date(),
  });

  await expense.save();
  return expense;
};

// Soft delete expense
export const softDeleteExpense = async (
  expenseId: string,
  deletedBy: { userId: string; name: string }
): Promise<void> => {
  if (!Types.ObjectId.isValid(expenseId)) {
    throw new AppError("Invalid expense ID", 400, "INVALID_EXPENSE_ID");
  }

  if (!Types.ObjectId.isValid(deletedBy.userId)) {
    throw new AppError("Invalid deleter ID", 400, "INVALID_USER_ID");
  }

  const expense = await ExpenseModel.findOne({
    _id: expenseId,
    isDeleted: false,
  });
  if (!expense) {
    throw new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: deletedBy.userId,
    messId: expense.messId,
    isApproved: true,
  });
  if (!user || ![UserRole.Admin, UserRole.Manager].includes(user.role)) {
    throw new AppError(
      "Only admins or managers can delete expenses",
      403,
      "FORBIDDEN"
    );
  }
  expense.isDeleted = true;
  expense.deletedBy = new Types.ObjectId(deletedBy.userId);
  expense.deletedAt = new Date();
  await expense.save();

  await ActivityLogModel.create({
    messId: expense.messId,
    entity: "Expense",
    entityId: expenseId,
    action: "deleted",
    performedBy: {
      userId: new Types.ObjectId(deletedBy.userId),
      name: deletedBy.name,
    },
    timestamp: new Date(),
  });
  await expense.save();
};
