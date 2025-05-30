import { Document, Types } from "mongoose";
import { IActivityLog, TransactionType } from "../Account/account.interface";

export interface ITransaction extends Document {
  accountId: Types.ObjectId;
  amount: number;
  type: TransactionType;
  description: string;
  date: Date;
  createdBy: Types.ObjectId;
  activityLogs: IActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}
