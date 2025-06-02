import { Document, model, Schema, Types } from "mongoose";
import { IMSetting } from "./MSetting.interface";

const SettingSchema = new Schema<IMSetting>(
  {
    messId: {
      type: Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
      unique: true,
    },
    breakfast: { type: Boolean, required: true, default: true },
    lunch: { type: Boolean, required: true, default: true },
    dinner: { type: Boolean, required: true, default: true },
    memberResponsibleForGrocery: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SettingSchema.index({ messId: 1 }, { unique: true });

const SettingModel = model<IMSetting>("Setting", SettingSchema);
export default SettingModel;
