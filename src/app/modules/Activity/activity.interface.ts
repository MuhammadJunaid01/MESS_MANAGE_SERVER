import { Types } from "mongoose";

export enum ActivityAction {
  Created = "created",
  Updated = "updated",
  Approved = "approved",
  Rejected = "rejected",
  Deleted = "deleted",
}

export enum ActivityEntity {
  Meal = "Meal",
  Expense = "Expense",
}

export interface IActivityLog extends Document {
  messId: Types.ObjectId;
  entity: ActivityEntity;
  entityId: Types.ObjectId;
  action: ActivityAction;
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
  action?: ActivityAction;
  entity?: ActivityEntity;
  limit?: number;
  skip?: number;
}
