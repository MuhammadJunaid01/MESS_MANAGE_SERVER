import { Schema, model } from "mongoose";
import { IStatus } from "../../interfaces";
import {
  ExpenseCategory,
  GroceryCategory,
  GroceryUnit,
  IExpense,
  IGroceryItem,
} from "./expense.interface";

const GroceryItemSchema = new Schema<IGroceryItem>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    quantity: {
      type: Number,
      required: true,
      min: [0.001, "Quantity must be positive"],
    },
    unit: { type: String, enum: Object.values(GroceryUnit), required: true },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      enum: Object.values(GroceryCategory),
      required: true,
    },
  },
  {
    _id: false,
  }
);

const ExpenseSchema = new Schema<IExpense>(
  {
    messId: { type: Schema.Types.ObjectId, ref: "Mess", required: true },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(IStatus),
      default: IStatus.Pending,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Description too long"],
    },
    date: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, default: new Date() },
    items: {
      type: [GroceryItemSchema],
      default: undefined,
      required: function () {
        return this?.category === ExpenseCategory.Grocery;
      },
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
ExpenseSchema.index({ messId: 1 });
ExpenseSchema.index({ status: 1 });
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ createdBy: 1 });
ExpenseSchema.index({ messId: 1, status: 1, isDeleted: 1 });

const ExpenseModel = model<IExpense>("Expense", ExpenseSchema);
export default ExpenseModel;
