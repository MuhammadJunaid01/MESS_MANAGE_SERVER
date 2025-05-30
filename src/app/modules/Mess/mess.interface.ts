import { Document, Types } from "mongoose";
import { ILocation } from "../../interfaces";
export interface IActivityLog {
  action: "created" | "updated" | "deleted" | "activated" | "deactivated";
  performedBy: {
    name: string;
    userId: Types.ObjectId;
  };
  timestamp: Date;
}

export interface IMess extends Document {
  messId: number;
  name: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  location: ILocation;
  status: "active" | "inactive";
  isDeleted: boolean;
  activityLogs: IActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}
