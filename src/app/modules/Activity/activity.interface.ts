import { Types } from "mongoose";
import { IStatus } from "../../interfaces";

export enum ActivityEntity {
  Meal = "Meal",
  Expense = "Expense",
}

export interface IActivityLog extends Document {
  messId: Types.ObjectId;
  entity: ActivityEntity;
  entityId: Types.ObjectId;
  action: IStatus;
  performedBy: {
    userId: Types.ObjectId;
    name: string;
  };
  timestamp: Date;
  details?: string;
}
export interface ActivityFilters {
  messId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  action?: IStatus;
  entity?: ActivityEntity;
  limit?: number;
  skip?: number;
}
