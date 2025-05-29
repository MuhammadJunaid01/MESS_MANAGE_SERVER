import { Document, Types } from "mongoose";
import { ILocation } from "../../interfaces";

export interface IMess extends Document {
  messId: string;
  name: string;
  createdBy: Types.ObjectId;
  location: ILocation;
}
