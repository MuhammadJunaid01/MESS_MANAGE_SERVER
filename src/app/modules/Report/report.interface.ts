import { Types } from "mongoose";

export interface MealReportFilters {
  messId: Types.ObjectId;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  groupBy?: "mess" | "user" | "date";
  limit?: number;
  skip?: number;
}

// Interface for meal report output
export interface MealReportResult {
  _id: {
    mess?: { _id: string; name: string; messId: number };
    user?: { _id: string; name: string; email: string };
    date?: string;
  };
  totalMeals: number;
  totalActiveMeals: number;
  totalCost: number;
  perMealRate: number;
  breakfast: { active: number; inactive: number; total: number };
  lunch: { active: number; inactive: number; total: number };
  dinner: { active: number; inactive: number; total: number };
}
export interface IUsersMeal {
  _id: string;
  name: string;
  totalMeals: number;
  totalActiveMeals: number;
  totalCost: number;
}

export interface UsersMealFilters {
  messId: Types.ObjectId;
  dateFrom?: string;
  dateTo?: string;
  skip?: number;
  limit?: number;
}
