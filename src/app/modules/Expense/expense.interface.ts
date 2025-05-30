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

  // Masala Categories
  Turmeric = "Turmeric", // Haldi
  ChiliPowder = "Chili Powder", // Lal Mirch
  Coriander = "Coriander", // Dhania
  Cumin = "Cumin", // Jeera
  BlackPepper = "Black Pepper", // Kali Mirch
  GaramMasala = "Garam Masala",
  Cardamom = "Cardamom", // Elaichi
  Cloves = "Cloves", // Laung
  BayLeaf = "Bay Leaf", // Tej Patta
  MustardSeed = "Mustard Seed", // Rai/Sarson
  Fenugreek = "Fenugreek", // Methi
  Fennel = "Fennel", // Saunf
  Cinnamon = "Cinnamon", // Dalchini
  Nutmeg = "Nutmeg", // Jaiphal
  StarAnise = "Star Anise", // Chakr Phool
  Asafetida = "Asafoetida", // Hing
  Others = "Others", // For any uncategorized masalas
}

export interface IGroceryItems {
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
  timeline?: ITimeline;
  items?: IGroceryItems[];
}
