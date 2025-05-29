import { Document, Types } from "mongoose";
import { ITimeline } from "../../interfaces";
export enum ExpenseStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export enum ExpenseCategory {
  Grocery = "Grocery",
  Utility = "Utility",
  Maintenance = "Maintenance",
}

export interface IExpense extends Document {
  messId: Types.ObjectId;
  category: ExpenseCategory;
  status: ExpenseStatus;
  amount: number;
  description: string;
  date: Date;
  createdBy: Types.ObjectId;
  timeline?: ITimeline;
}
