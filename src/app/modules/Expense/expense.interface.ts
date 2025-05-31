import { Document, Types } from "mongoose";
import { IStatus } from "../../interfaces";

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

export enum GroceryCategory {
  Vegetables = "Vegetables",
  Fruits = "Fruits",
  Meat = "Meat",
  Fish = "Fish",
  Oil = "Oil",
  Salt = "Salt",
  Rice = "Rice",
  Lentils = "Lentils",
  CleaningSupplies = "Cleaning Supplies",
  Turmeric = "Turmeric",
  ChiliPowder = "Chili Powder",
  Coriander = "Coriander",
  Cumin = "Cumin",
  BlackPepper = "Black Pepper",
  GaramMasala = "Garam Masala",
  Cardamom = "Cardamom",
  Cloves = "Cloves",
  BayLeaf = "Bay Leaf",
  MustardSeed = "Mustard Seed",
  Fenugreek = "Fenugreek",
  Fennel = "Fennel",
  Cinnamon = "Cinnamon",
  Nutmeg = "Nutmeg",
  StarAnise = "Star Anise",
  Asafetida = "Asafoetida",
  Others = "Others",
}

export interface IGroceryItem {
  name: string;
  quantity: number;
  unit: GroceryUnit;
  price: number;
  category: GroceryCategory;
}

export interface IExpense extends Document {
  messId: Types.ObjectId;
  category: ExpenseCategory;
  status: IStatus;
  amount: number;
  description: string;
  date: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  items?: IGroceryItem[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
}
