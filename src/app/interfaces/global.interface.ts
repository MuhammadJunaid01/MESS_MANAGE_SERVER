import { Router } from "express";
import { Types } from "mongoose";
import { UserRole } from "../modules/User/user.interface";

export interface ITimeline {
  createdBy: {
    userId: Types.ObjectId; // or Types.ObjectId if using Mongoose
    name: string; // Optional, for quick display
    timestamp: Date;
  };
  approvedBy?: {
    userId: string; // or Types.ObjectId
    name: string;
    timestamp: Date;
  };
  rejectedBy?: {
    userId: Types.ObjectId; // or Types.ObjectId
    name: string;
    timestamp: Date;
  };
  updatedBy?: Array<{
    userId: Types.ObjectId; // or Types.ObjectId
    name: string;
    timestamp: Date;
  }>;
}
export interface ILocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// export enum IStatus {
//   Pending = "Pending",
//   Approved = "Approved",
//   Rejected = "Rejected",
// }

export enum IStatus {
  Created = "created",
  Updated = "updated",
  Approved = "approved",
  Rejected = "rejected",
  Deleted = "deleted",
  Pending = "pending",
  Activated = "activated",
  Deactivated = "deactivated",
  JoinMess = "joinMess",
  LeaveMess = "leaveMess",
}
export type TErrorReturnType = {
  statusCode: number;
  message: string;
  errorSources: TErrorSource[];
};

export type TErrorSource = {
  path: string | number;
  message: string;
};
export interface IRoute {
  path: string;
  route: Router;
}

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  messId?: Types.ObjectId;
}
