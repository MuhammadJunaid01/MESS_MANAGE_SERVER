"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const meal_interface_1 = require("./meal.interface");
const MealEntrySchema = new mongoose_1.Schema({
    type: { type: String, enum: Object.values(meal_interface_1.MealType), required: true },
    isActive: { type: Boolean, required: true, default: true },
    numberOfMeals: { type: Number, required: true, default: 0 },
}, { _id: false });
const MealSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    messId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Mess", required: true },
    date: { type: Date, required: true },
    meals: { type: [MealEntrySchema], required: true, default: [] },
});
// Indexes
MealSchema.index({ userId: 1, messId: 1, date: 1 }, { unique: true });
MealSchema.index({ messId: 1 });
MealSchema.index({ date: 1 });
MealSchema.index({ messId: 1, date: 1 });
const MealModel = (0, mongoose_1.model)("Meal", MealSchema);
exports.default = MealModel;
