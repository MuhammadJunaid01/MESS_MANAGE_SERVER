import { Types } from "mongoose";

export enum TransactionType {
  Credit = "credit",
  Debit = "debit",
}

export enum IActivityAction {
  Created = "created",
  Updated = "updated",
  Deleted = "deleted",
}

export interface IActivityLog {
  action: IActivityAction;
  performedBy: {
    userId: Types.ObjectId;
    name: string;
  };
  timestamp: Date;
}

export interface IAccount extends Document {
  userId: Types.ObjectId;
  messId: Types.ObjectId;
  balance: number;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
  activityLogs: IActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}
