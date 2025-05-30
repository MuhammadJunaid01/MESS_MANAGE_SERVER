import { Document, Types } from "mongoose";

export enum UserRole {
  Admin = "Admin",
  Member = "Member",
  Buyer = "Buyer",
  UtilityManager = "UtilityManager",
  MealManager = "MealManager",
  Viewer = "Viewer",
  Manager = "Manager",
}

export enum Gender {
  Male = "Male",
  Female = "Female",
  NonBinary = "Non-Binary",
  Other = "Other",
  PreferNotToSay = "PreferNotToSay",
}

export interface IActivityLog {
  action: "approved" | "rejected" | "blocked" | "unblocked" | "joined_mess";
  performedBy: {
    name: string;
    managerId: Types.ObjectId;
  };
  timestamp: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  gender: Gender;
  dateOfBirth?: Date;
  password: string;
  phone: string;
  address?: string;
  profilePicture?: string;
  nid?: string;
  role: UserRole;
  messId?: Types.ObjectId;
  balance: number; // Stored in smallest unit (e.g., cents)
  isVerified: boolean;
  isBlocked: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  otp?: string;
  otpExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  refreshToken?: string;
  activityLogs: IActivityLog[];
}
