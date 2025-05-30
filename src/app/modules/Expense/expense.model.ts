import mongoose, { Schema } from "mongoose";
import { IStatus } from "../../interfaces";
import {
  ExpenseCategory,
  GroceryUnit,
  IExpense,
  IGroceryItems,
} from "./expense.interface";
const TimelineSchema = new Schema(
  {
    createdBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      timestamp: { type: Date, required: true },
    },
    approvedBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: String,
      timestamp: Date,
    },
    rejectedBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: String,
      timestamp: Date,
    },
    updatedBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        name: String,
        timestamp: Date,
      },
    ],
  },
  { _id: false }
);
const GroceryItemSchema = new Schema<IGroceryItems>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: {
      type: String,
      enum: Object.values(GroceryUnit),
      required: true,
    },
    price: Number,
    category: String,
  },
  { _id: false }
);

const ExpenseSchema = new Schema<IExpense>({
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
  amount: { type: Number, required: true },
  description: String,
  date: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timeline: {
    type: TimelineSchema, // Adjust if you have a schema for timeline
  },
  items: {
    type: [GroceryItemSchema],
    required: function () {
      // 'this' is the document being validated
      return this.category === ExpenseCategory.Grocery;
    },
  },
});

const ExpenseModel = mongoose.model<IExpense>("Expense", ExpenseSchema);
export default ExpenseModel;
