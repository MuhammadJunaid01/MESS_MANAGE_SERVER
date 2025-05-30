import { Document, Types } from "mongoose";
import { IStatus, ITimeline } from "../../interfaces";

export enum ExpenseCategory {
  Grocery = "Grocery",
  Utility = "Utility",
  Maintenance = "Maintenance",
}
export enum GroceryUnit {
  Kg = "kg",
  Gram = "g",
  Liter = "l",
  Milliliter = "ml",
  Piece = "pcs",
  Pack = "pack",
  Bottle = "bottle",
}

export interface IGroceryItems {
  name: string;
  quantity: number;
  unit: GroceryUnit;
  price?: number;
  category?: string;
}
export interface IExpense extends Document {
  messId: Types.ObjectId;
  category: ExpenseCategory;
  status: IStatus;
  amount: number;
  description: string;
  date: Date;
  createdBy: Types.ObjectId;
  timeline?: ITimeline;
  items?: IGroceryItems[];
}
