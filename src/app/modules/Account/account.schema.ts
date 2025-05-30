import { Schema, model } from "mongoose";
import { IAccount, IActivityAction, IActivityLog } from "./account.interface";

const ActivityLogSchema = new Schema<IActivityLog>({
  action: {
    type: String,
    enum: Object.values(IActivityAction),
    required: true,
  },
  performedBy: {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
  },
  timestamp: { type: Date, default: Date.now },
});

const AccountSchema = new Schema<IAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messId: { type: Schema.Types.ObjectId, ref: "Mess", required: true },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    activityLogs: { type: [ActivityLogSchema], select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
AccountSchema.index({ userId: 1, messId: 1 }, { unique: true });
AccountSchema.index({ messId: 1 });
AccountSchema.index({ isDeleted: 1 });

const AccountModel = model<IAccount>("Account", AccountSchema);
export default AccountModel;
