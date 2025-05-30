import { Types } from "mongoose";

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
  latitude?: number; // Latitude coordinate
  longitude?: number; // Longitude coordinate
  address?: string; // Optional full address
  city?: string; // Optional city name
  state?: string; // Optional state or region
  country?: string; // Optional country name
  postalCode?: string; // Optional postal/zip code
  createdAt?: Date; // Optional timestamp for when the location was created
  updatedAt?: Date; // Optional timestamp for when the location was last updated
}
export enum IStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}
