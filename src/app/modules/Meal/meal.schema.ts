import { Schema, model } from "mongoose";
import { IMeal, IMealEntry, MealType } from "./meal.interface";

const MealEntrySchema = new Schema<IMealEntry>(
  {
    type: { type: String, enum: Object.values(MealType), required: true },
    isActive: { type: Boolean, required: true, default: true },
    numberOfMeals: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const MealSchema = new Schema<IMeal>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  messId: { type: Schema.Types.ObjectId, ref: "Mess", required: true },
  date: { type: Date, required: true },
  meals: { type: [MealEntrySchema], required: true, default: [] },
});

// Indexes
MealSchema.index({ userId: 1, messId: 1, date: 1 }, { unique: true });
MealSchema.index({ messId: 1 });
MealSchema.index({ date: 1 });
MealSchema.index({ messId: 1, date: 1 });

const MealModel = model<IMeal>("Meal", MealSchema);
export default MealModel;
