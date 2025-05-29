import { Types } from "mongoose";
export enum UserRole {
  Admin = "Admin",
  Member = "Member",
  Buyer = "Buyer",
  UtilityManager = "UtilityManager",
  MealManager = "MealManager",
  Viewer = "Viewer",
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
}
