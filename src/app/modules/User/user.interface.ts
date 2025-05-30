import { Types } from "mongoose";
export enum UserRole {
  Admin = "Admin",
  Member = "Member",
  Buyer = "Buyer",
  UtilityManager = "UtilityManager",
  MealManager = "MealManager",
  Viewer = "Viewer",
}
export enum TransactionType {
  Credit = "credit",
  Debit = "debit",
}

export interface Transaction {
  date: string;
  amount: number;
  type: TransactionType; // ক্রেডিট: মেস পেমেন্ট করেছে; ডেবিট: মেস টাকা পেয়েছে
  description: string;
}
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  profilePicture?: string;
  nid?: string;
  role: UserRole;
  messId: Types.ObjectId;
  balance: number;
  isVerified: boolean;
  isBlocked: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  payable: number; // মেস থেকে পাবে
  receivable: number; // মেসকে দিবে
  transactionHistory: Transaction[];
}
