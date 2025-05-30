import { Types } from "mongoose";
import { AppError } from "../../middlewares/errors";
import MessModel from "../Mess/mess.schema";
import { ITransaction } from "../Transaction/transaction.interface";
import TransactionModel from "../Transaction/transaction.schema";
import { UserRole } from "../User/user.interface";
import UserModel from "../User/user.model";
import {
  IAccount,
  IActivityAction,
  TransactionType,
} from "./account.interface";
import AccountModel from "./account.schema";

// Interface for account creation input
interface CreateAccountInput {
  userId: string;
  messId: string;
}

// Interface for transaction creation input
interface CreateTransactionInput {
  accountId: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: Date;
}

// Interface for activity log input
interface ActivityLogInput {
  action: "created" | "updated" | "deleted" | "credited" | "debited";
  performedBy: {
    userId: string;
    name: string;
  };
}

// Create a new account
export const createAccount = async (
  input: CreateAccountInput,
  createdBy: { userId: string; name: string }
): Promise<IAccount> => {
  const { userId, messId } = input;

  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(messId)) {
    throw new AppError("Invalid user or mess ID", 400, "INVALID_ID");
  }

  if (!Types.ObjectId.isValid(createdBy.userId)) {
    throw new AppError("Invalid creator ID", 400, "INVALID_USER_ID");
  }

  const mess = await MessModel.findById(messId);
  if (!mess || mess.isDeleted) {
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

  const creator = await UserModel.findById(createdBy.userId);
  if (!creator || ![UserRole.Admin, UserRole.Manager].includes(creator.role)) {
    throw new AppError(
      "Only admins or managers can create accounts",
      403,
      "FORBIDDEN"
    );
  }

  const existingAccount = await AccountModel.findOne({
    userId,
    messId,
    isDeleted: false,
  });
  if (existingAccount) {
    throw new AppError(
      "Account already exists for this user in this mess",
      400,
      "ACCOUNT_EXISTS"
    );
  }

  const account = await AccountModel.create({
    userId: new Types.ObjectId(userId),
    messId: new Types.ObjectId(messId),
    balance: 0,
    createdBy: new Types.ObjectId(createdBy.userId),
    activityLogs: [
      {
        action: "created",
        performedBy: {
          userId: new Types.ObjectId(createdBy.userId),
          name: createdBy.name,
        },
        timestamp: new Date(),
      },
    ],
  });

  return account;
};

// Get account by ID
export const getAccountById = async (
  accountId: string,
  userId: string
): Promise<IAccount> => {
  if (!Types.ObjectId.isValid(accountId) || !Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid account or user ID", 400, "INVALID_ID");
  }

  const account = await AccountModel.findOne({
    _id: accountId,
    isDeleted: false,
  })
    .select("-activityLogs")
    .populate("userId", "name email")
    .populate("messId", "name messId");
  if (!account) {
    throw new AppError("Account not found", 404, "ACCOUNT_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: userId,
    messId: account.messId,
    isApproved: true,
  });
  if (!user) {
    throw new AppError(
      "User is not an approved member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  return account;
};

// Get accounts with filters
export const getAccounts = async (
  filters: {
    messId?: string;
    userId?: string;
    limit?: number;
    skip?: number;
  },
  userId: string
): Promise<IAccount[]> => {
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

  const query: any = { isDeleted: false };
  if (filters.messId) query.messId = new Types.ObjectId(filters.messId);
  if (filters.userId) query.userId = new Types.ObjectId(filters.userId);

  return AccountModel.find(query)
    .select("-activityLogs")
    .populate("userId", "name email")
    .populate("messId", "name messId")
    .limit(filters.limit || 100)
    .skip(filters.skip || 0)
    .sort({ createdAt: -1 });
};

// Create a transaction
export const createTransaction = async (
  input: CreateTransactionInput,
  createdBy: { userId: string; name: string }
): Promise<{ account: IAccount; transaction: ITransaction }> => {
  if (
    !Types.ObjectId.isValid(input.accountId) ||
    !Types.ObjectId.isValid(createdBy.userId)
  ) {
    throw new AppError("Invalid account or user ID", 400, "INVALID_ID");
  }

  const account = await AccountModel.findOne({
    _id: input.accountId,
    isDeleted: false,
  });
  if (!account) {
    throw new AppError("Account not found", 404, "ACCOUNT_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: createdBy.userId,
    messId: account.messId,
    isApproved: true,
  });
  if (!user || ![UserRole.Admin, UserRole.Manager].includes(user.role)) {
    throw new AppError(
      "Only admins or managers can create transactions",
      403,
      "FORBIDDEN"
    );
  }

  const { amount, type, description, date } = input;
  const balanceUpdate = type === TransactionType.Credit ? amount : -amount;
  const newBalance = account.balance + balanceUpdate;

  if (newBalance < 0) {
    throw new AppError(
      "Insufficient balance for debit",
      400,
      "INSUFFICIENT_BALANCE"
    );
  }

  const transaction = await TransactionModel.create({
    accountId: new Types.ObjectId(input.accountId),
    amount,
    type,
    description,
    date,
    createdBy: new Types.ObjectId(createdBy.userId),
    activityLogs: [
      {
        action: type === TransactionType.Credit ? "credited" : "debited",
        performedBy: {
          userId: new Types.ObjectId(createdBy.userId),
          name: createdBy.name,
        },
        timestamp: new Date(),
      },
    ],
  });

  account.balance = newBalance;
  account.updatedBy = new Types.ObjectId(createdBy.userId);
  account.activityLogs.push({
    action: IActivityAction.Created,
    performedBy: {
      userId: new Types.ObjectId(createdBy.userId),
      name: createdBy.name,
    },
    timestamp: new Date(),
  });

  await account.save();

  return { account, transaction };
};

// Get transactions for an account
export const getTransactions = async (
  filters: {
    accountId: string;
    type?: TransactionType;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    skip?: number;
  },
  userId: string
): Promise<ITransaction[]> => {
  if (
    !Types.ObjectId.isValid(filters.accountId) ||
    !Types.ObjectId.isValid(userId)
  ) {
    throw new AppError("Invalid account or user ID", 400, "INVALID_ID");
  }

  const account = await AccountModel.findOne({
    _id: filters.accountId,
    isDeleted: false,
  });
  if (!account) {
    throw new AppError("Account not found", 404, "ACCOUNT_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: userId,
    messId: account.messId,
    isApproved: true,
  });
  if (!user) {
    throw new AppError(
      "User is not an approved member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  const query: any = { accountId: new Types.ObjectId(filters.accountId) };
  if (filters.type) query.type = filters.type;
  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) query.date.$gte = filters.dateFrom;
    if (filters.dateTo) query.date.$lte = filters.dateTo;
  }

  return TransactionModel.find(query)
    .select("-activityLogs")
    .populate("createdBy", "name email")
    .limit(filters.limit || 100)
    .skip(filters.skip || 0)
    .sort({ date: -1 });
};

// Soft delete account
export const softDeleteAccount = async (
  accountId: string,
  deletedBy: { userId: string; name: string }
): Promise<void> => {
  if (
    !Types.ObjectId.isValid(accountId) ||
    !Types.ObjectId.isValid(deletedBy.userId)
  ) {
    throw new AppError("Invalid account or user ID", 400, "INVALID_ID");
  }

  const account = await AccountModel.findOne({
    _id: accountId,
    isDeleted: false,
  });
  if (!account) {
    throw new AppError("Account not found", 404, "ACCOUNT_NOT_FOUND");
  }

  const user = await UserModel.findOne({
    _id: deletedBy.userId,
    messId: account.messId,
    isApproved: true,
  });
  if (!user || ![UserRole.Admin].includes(user.role)) {
    throw new AppError("Only admins can delete accounts", 403, "FORBIDDEN");
  }

  account.isDeleted = true;
  account.updatedBy = new Types.ObjectId(deletedBy.userId);
  account.activityLogs.push({
    action: IActivityAction.Deleted,
    performedBy: {
      userId: new Types.ObjectId(deletedBy.userId),
      name: deletedBy.name,
    },
    timestamp: new Date(),
  });

  await account.save();
};
