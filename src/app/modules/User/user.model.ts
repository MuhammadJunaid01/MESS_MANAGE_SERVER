import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";
import { Gender, IActivityLog, IUser, UserRole } from "./user.interface";

const ActivityLogSchema = new Schema<IActivityLog>({
  action: {
    type: String,
    enum: ["approved", "rejected", "blocked", "unblocked"],
    required: true,
  },
  performedBy: {
    name: { type: String, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  timestamp: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: true,
    },
    dateOfBirth: { type: Date },
    password: { type: String, required: true, select: false },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^\+?[1-9]\d{1,14}$/.test(v),
        message: "Invalid phone number format",
      },
    },
    address: { type: String, trim: true },
    profilePicture: { type: String },
    nid: {
      type: String,
      validate: {
        validator: (v: string) => /^\d{10,17}$/.test(v),
        message: "Invalid NID format",
      },
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Viewer,
    },
    messId: { type: Schema.Types.ObjectId, ref: "Mess" },
    balance: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    resetToken: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    activityLogs: [ActivityLogSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ messId: 1, role: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });
UserSchema.index({ resetTokenExpires: 1 }, { expireAfterSeconds: 0 });

// Password hashing middleware
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = model<IUser>("User", UserSchema);
export default UserModel;
