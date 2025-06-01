import { Types } from "mongoose";

export enum MealType {
  Breakfast = "Breakfast",
  Lunch = "Lunch",
  Dinner = "Dinner",
}

export interface IMealEntry {
  type: MealType;
  isActive: boolean;
  numberOfMeals: number; // Added field to track the number of meals
}

export interface IMeal extends Document {
  userId: Types.ObjectId;
  messId: Types.ObjectId;
  date: Date;
  meals: IMealEntry[];
}
