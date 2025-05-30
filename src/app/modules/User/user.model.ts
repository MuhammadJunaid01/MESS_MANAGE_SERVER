import { model, Schema } from "mongoose";
import {
  IUser,
  Transaction,
  TransactionType,
  UserRole,
} from "./user.interface";
const transactionHistory = new Schema<Transaction>(
  {
    date: { type: String, required: true }, // Using ISO 8601 formatted string
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: Object.values(TransactionType), // Enforcing the enum values
      required: true,
    },
    description: { type: String, required: true },
  },
  { timestamps: true, _id: false } // Auto timestamps, no separate _id field
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    profilePicture: { type: String },
    nid: {
      type: String,
      validate: {
        validator: (v: string) => /^\d{10,17}$/.test(v), // Basic NID validation
        message: "Invalid NID format",
      },
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Viewer,
    },
    messId: { type: Schema.Types.ObjectId, ref: "Mess" },
    balance: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    transactionHistory: {
      type: [transactionHistory],
      default: [],
    },
    payable: {
      type: Number,
      default: 0,
    },
    receivable: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
const UserModel = model<IUser>("User", UserSchema);
export default UserModel;
