import { Schema, model } from "mongoose";
import { ILocation } from "../../interfaces";
import { IMess } from "./mess.interface";

const LocationSchema = new Schema<ILocation>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Schema for Mess
const MessSchema = new Schema<IMess>(
  {
    messId: { type: String, unique: true },
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: LocationSchema, required: true },
  },
  { timestamps: true }
);
MessSchema.pre("save", async function (next) {
  const doc = this as IMess;

  if (!doc.messId) {
    // Find the latest messId and generate the next one
    const lastMess = await MessModel.findOne().sort({ messId: -1 }).exec();
    let nextId = 1;

    if (lastMess?.messId) {
      // Convert the last messId to a number and increment
      nextId = parseInt(lastMess.messId, 10) + 1;
    }

    // Pad the nextId with leading zeros
    doc.messId = nextId.toString().padStart(2, "0");
  }

  next();
});

// Model for Mess
const MessModel = model<IMess>("Mess", MessSchema);

export default MessModel;
