import { Schema, model } from "mongoose";
import { TransactionType } from "../Account/account.interface";
import { ITransaction } from "./transaction.interface";

const TransactionSchema = new Schema<ITransaction>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be positive"],
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Description too long"],
    },
    date: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    activityLogs: { type: Schema.Types.Mixed, default: [] }, // Reuse ActivityLogSchema
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
TransactionSchema.index({ accountId: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1 });

const TransactionModel = model<ITransaction>("Transaction", TransactionSchema);
export default TransactionModel;
