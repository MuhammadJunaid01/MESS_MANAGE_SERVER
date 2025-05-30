import { Schema, model } from "mongoose";
import {
  ExpenseCategory,
  ExpenseStatus,
  GroceryCategory,
  GroceryUnit,
  IActivityLog,
  IExpense,
  IGroceryItem,
} from "./expense.interface";

const GroceryItemSchema = new Schema<IGroceryItem>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  quantity: {
    type: Number,
    required: true,
    min: [0.001, "Quantity must be positive"],
  },
  unit: { type: String, enum: Object.values(GroceryUnit), required: true },
  price: { type: Number, required: true, min: [0, "Price cannot be negative"] },
  category: {
    type: String,
    enum: Object.values(GroceryCategory),
    required: true,
  },
});

const ActivityLogSchema = new Schema<IActivityLog>({
  action: {
    type: String,
    enum: ["created", "updated", "approved", "rejected", "deleted"],
    required: true,
  },
  performedBy: {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
  },
  timestamp: { type: Date, default: Date.now },
});

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
      enum: Object.values(ExpenseStatus),
      default: ExpenseStatus.Pending,
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
    items: { type: [GroceryItemSchema], default: undefined },
    activityLogs: { type: [ActivityLogSchema], select: false },
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
