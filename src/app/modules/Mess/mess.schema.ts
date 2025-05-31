import { Schema, model } from "mongoose";
import { ILocation } from "../../interfaces/global.interface";
import { IMess } from "./mess.interface";

const LocationSchema = new Schema<ILocation>({
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: (v: [number, number]) => {
        const [lon, lat] = v;
        return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
      },
      message:
        "Invalid coordinates: longitude must be -180 to 180, latitude -90 to 90",
    },
  },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },
  postalCode: { type: String, trim: true },
});

const MessSchema = new Schema<IMess>(
  {
    messId: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    location: { type: LocationSchema, required: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
MessSchema.index({ messId: 1 }, { unique: true });
MessSchema.index({ name: 1 }, { unique: true });
MessSchema.index({ "location.coordinates": "2dsphere" });
MessSchema.index({ createdBy: 1 });
MessSchema.index({ status: 1, isDeleted: 1 });

const MessModel = model<IMess>("Mess", MessSchema);
export default MessModel;
