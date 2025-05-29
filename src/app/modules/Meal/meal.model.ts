import mongoose, { Schema } from "mongoose";
import { IMeal, MealType } from "./meal.interface";

const MealSchema = new Schema<IMeal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messId: { type: Schema.Types.ObjectId, ref: "Mess", required: true },
    date: { type: Date, required: true, default: new Date() },
    breakfast: {
      type: {
        type: String,
        enum: [MealType.Breakfast],
        default: MealType.Breakfast,
        required: true,
      },
      isActive: { type: Boolean, default: false },
    },
    lunch: {
      type: {
        type: String,
        enum: [MealType.Lunch],
        default: MealType.Lunch,
        required: true,
      },
      isActive: { type: Boolean, default: false },
    },
    dinner: {
      type: {
        type: String,
        enum: [MealType.Dinner],
        default: MealType.Dinner,
        required: true,
      },
      isActive: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const MealModel = mongoose.model<IMeal>("Meal", MealSchema);

export default MealModel;
