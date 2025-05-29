import { Document, Types } from "mongoose";
export enum MealType {
  Breakfast = "Breakfast",
  Lunch = "Lunch",
  Dinner = "Dinner",
}
export interface IMeal extends Document {
  userId: Types.ObjectId;
  messId: Types.ObjectId;
  date: Date;
  breakfast: {
    type: MealType.Breakfast;
    isActive: boolean;
  };
  lunch: {
    type: MealType.Lunch;
    isActive: boolean;
  };
  dinner: {
    type: MealType.Dinner;
    isActive: boolean;
  };
}
