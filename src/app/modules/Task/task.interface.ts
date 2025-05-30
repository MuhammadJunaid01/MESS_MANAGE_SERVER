import { Document, Types } from "mongoose";
import { IStatus } from "../../interfaces";

// Enum for task types
export enum TaskType {
  GroceryBuyer = "GroceryBuyer",
  UtilityManager = "UtilityManager",
  MealManager = "MealManager",
}

// Enum for urgency levels
export enum Urgency {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

// Interface for task status

// Interface for task
export interface ITask extends Document {
  messId: Types.ObjectId; // Unique identifier for the mess
  assignedTo: Types.ObjectId; // Unique identifier for the member assigned
  type: TaskType; // Task type
  status: IStatus; // Current status of the task
  startDate: Date; // Task start date
  endDate: Date; // Task end date
  urgency: Urgency; // Urgency level of the task
  description?: string;
}
