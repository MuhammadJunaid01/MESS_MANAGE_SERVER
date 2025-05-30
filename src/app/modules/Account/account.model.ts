import { Schema, Types, model } from "mongoose";
import {
  IAccount,
  IAccountTransaction,
  TransactionType,
} from "./account.interface";

const transactionSchema = new Schema<IAccountTransaction>(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    description: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

// Account schema
const accountSchema = new Schema<IAccount>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "Member" },
    messId: { type: Schema.Types.ObjectId, required: true, ref: "Mess" },
    balance: { type: Number, required: true, default: 0 },
    transactions: { type: [transactionSchema], default: [] },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

// Account model
const AccountModel = model<IAccount>("Account", accountSchema);

export default AccountModel;
