import { Document, Types } from "mongoose";
import { ILocation } from "../../interfaces/global.interface";

export interface IMess extends Document {
  messId: number;
  name: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  location: ILocation;
  status: "active" | "inactive";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
