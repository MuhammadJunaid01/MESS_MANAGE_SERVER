import { model, Schema } from "mongoose";
import { IUser, UserRole } from "./user.interface";

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
  },
  {
    timestamps: true,
  }
);
const UserModel = model<IUser>("User", UserSchema);
export default UserModel;
