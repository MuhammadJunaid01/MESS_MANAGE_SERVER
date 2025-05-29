import { Document, Types } from "mongoose";

export interface ITask extends Document {
  messId: Types.ObjectId;
  assignedTo: Types.ObjectId;
  type: "GroceryBuyer" | "UtilityManager" | "MealManager";
  status: "Pending" | "Completed";
  startDate: Date;
  endDate: Date;
}
