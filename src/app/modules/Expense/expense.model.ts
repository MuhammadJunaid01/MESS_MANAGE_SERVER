import mongoose, { Schema } from "mongoose";
import { ExpenseCategory, ExpenseStatus, IExpense } from "./expense.interface";

const ExpenseSchema = new Schema<IExpense>({
  messId: { type: Schema.Types.ObjectId, ref: "Mess", required: true },
  category: {
    type: String,
    enum: Object.values(ExpenseCategory),
    required: true,
  },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: Object.values(ExpenseStatus),
    default: ExpenseStatus.Pending,
  },
  timeline: {
    createdBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      timestamp: { type: Date, required: true },
    },
    approvedBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
      timestamp: { type: Date },
    },
    rejectedBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
      timestamp: { type: Date },
    },
    updatedBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        name: { type: String },
        timestamp: { type: Date },
      },
    ],
  },
});
const ExpenseModel = mongoose.model<IExpense>("Expense", ExpenseSchema);

export default ExpenseModel;
