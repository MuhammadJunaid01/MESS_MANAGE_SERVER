import crypto from "crypto";
import { Types } from "mongoose";

import { sendOtpEmail } from "../../lib/utils/sendEmail";
import { AppError } from "../../middlewares/errors";
import MessModel from "../Mess/mess.model";
import { Gender, IActivityLog, IUser, UserRole } from "./user.interface";
import UserModel from "./user.model";

// Interface for user creation input
interface CreateUserInput {
  name: string;
  email: string;
  gender: Gender;
  dateOfBirth?: Date;
  password: string;
  phone: string;
  address?: string;
  profilePicture?: string;
  nid?: string;
  role?: UserRole;
  messId?: string;
}

// Interface for user update input
interface UpdateUserInput {
  name?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  profilePicture?: string;
  nid?: string;
  role?: UserRole;
  messId?: string;
  balance?: number;
  isVerified?: boolean;
  isBlocked?: boolean;
  isApproved?: boolean;
}

// Interface for activity log input
interface ActivityLogInput {
  action: "approved" | "rejected" | "blocked" | "unblocked";
  performedBy: {
    name: string;
    managerId: Types.ObjectId;
  };
}

// Generate a 6-digit OTP
const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString().padStart(6, "0");
};

// Generate a reset token
const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Sign up a new user and send OTP
export const signUpUser = async (input: CreateUserInput): Promise<IUser> => {
  const { email, password, role = UserRole.Viewer, messId, ...rest } = input;

  // Check if email already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already exists", 400, "EMAIL_EXISTS");
  }

  // Generate OTP and expiration
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Convert messId to ObjectId if provided
  const userData: Partial<IUser> = {
    ...rest,
    email: email.toLowerCase(),
    password, // Will be hashed by pre-save middleware
    role,
    ...(messId && { messId: new Types.ObjectId(messId) }),
    balance: 0,
    isVerified: false,
    isBlocked: false,
    isApproved: false,
    activityLogs: [],
    otp,
    otpExpires,
  };

  const user = await UserModel.create(userData);

  // Send OTP email
  try {
    await sendOtpEmail(user.email, otp, user.name, "10 minutes");
  } catch (err) {
    // Delete user if email fails
    await UserModel.deleteOne({ _id: user._id });
    throw new AppError("Failed to send OTP email", 500, "EMAIL_SEND_FAILED");
  }

  return user;
};

// Verify OTP for signup
export const verifyOtp = async (email: string, otp: string): Promise<IUser> => {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
    "+otp +otpExpires"
  );
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (user.isVerified) {
    throw new AppError("User is already verified", 400, "ALREADY_VERIFIED");
  }

  if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
    throw new AppError("OTP is invalid or expired", 400, "INVALID_OTP");
  }

  if (user.otp !== otp) {
    throw new AppError("Invalid OTP", 400, "INVALID_OTP");
  }

  // Mark user as verified and clear OTP
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  // user.activityLogs.push({
  //   action: "approved",
  //   performedBy: {
  //     name: "System",
  //     managerId: user._id,
  //   },
  //   timestamp: new Date(),
  // });

  await user.save();
  return user;
};

// Forgot password: Generate and send OTP
export const forgotPassword = async (email: string): Promise<void> => {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
    "+otp +otpExpires +resetToken +resetTokenExpires"
  );
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  // Generate OTP and reset token
  const otp = generateOtp();
  const resetToken = generateResetToken();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Update user
  user.otp = otp;
  user.otpExpires = otpExpires;
  user.resetToken = resetToken;
  user.resetTokenExpires = otpExpires;

  await user.save();

  // Send OTP email
  try {
    await sendOtpEmail(user.email, otp, user.name, "10 minutes");
  } catch (err) {
    // Clear OTP and reset token if email fails
    user.otp = undefined;
    user.otpExpires = undefined;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    throw new AppError("Failed to send OTP email", 500, "EMAIL_SEND_FAILED");
  }
};

// Reset password with OTP and reset token
export const resetPassword = async (
  email: string,
  otp: string,
  resetToken: string,
  newPassword: string
): Promise<void> => {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
    "+otp +otpExpires +resetToken +resetTokenExpires +password"
  );
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
    throw new AppError("OTP is invalid or expired", 400, "INVALID_OTP");
  }

  if (user.otp !== otp || user.resetToken !== resetToken) {
    throw new AppError(
      "Invalid OTP or reset token",
      400,
      "INVALID_CREDENTIALS"
    );
  }

  // Update password and clear OTP/reset token
  user.password = newPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;

  await user.save();
};

// Create a new user (non-OTP version, for admin use)
export const createUser = async (input: CreateUserInput): Promise<IUser> => {
  const { email, password, role = UserRole.Viewer, messId, ...rest } = input;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already exists", 400, "EMAIL_EXISTS");
  }

  const userData: Partial<IUser> = {
    ...rest,
    email: email.toLowerCase(),
    password,
    role,
    balance: 0,
    isVerified: false,
    isBlocked: false,
    isApproved: false,
    activityLogs: [],
  };

  const user = await UserModel.create(userData);
  return user;
};

// Get user by ID
export const getUserById = async (userId: string): Promise<IUser> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_ID");
  }

  const user = await UserModel.findById(userId).select(
    "-password -otp -resetToken -refreshToken"
  );
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<IUser> => {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
    "-password -otp -resetToken -refreshToken"
  );
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
};

// Get all users with optional filters
export const getUsers = async (
  filters: {
    messId?: string;
    role?: UserRole;
    isVerified?: boolean;
    isBlocked?: boolean;
    isApproved?: boolean;
    limit?: number;
    skip?: number;
  } = {}
): Promise<IUser[]> => {
  const query: any = {};

  if (filters.messId) {
    query.messId = new Types.ObjectId(filters.messId);
  }
  if (filters.role) {
    query.role = filters.role;
  }
  if (typeof filters.isVerified === "boolean") {
    query.isVerified = filters.isVerified;
  }
  if (typeof filters.isBlocked === "boolean") {
    query.isBlocked = filters.isBlocked;
  }
  if (typeof filters.isApproved === "boolean") {
    query.isApproved = filters.isApproved;
  }

  return UserModel.find(query)
    .select("-password -otp -resetToken -refreshToken")
    .limit(filters.limit || 100)
    .skip(filters.skip || 0)
    .sort({ createdAt: -1 });
};

// Update user details
export const updateUser = async (
  userId: string,
  input: UpdateUserInput,
  updatedBy: { name: string; managerId: string }
): Promise<IUser> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_ID");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const updateData: Partial<IUser> = {};
  const activityLog: IActivityLog = {
    action: "approved", // Default to a valid action, will be overwritten below if needed
    performedBy: {
      name: updatedBy.name,
      managerId: new Types.ObjectId(updatedBy.managerId),
    },
    timestamp: new Date(),
  };

  if (input.name) updateData.name = input.name;
  if (input.gender) updateData.gender = input.gender;
  if (input.dateOfBirth) updateData.dateOfBirth = input.dateOfBirth;
  if (input.phone) updateData.phone = input.phone;
  if (input.address) updateData.address = input.address;
  if (input.profilePicture) updateData.profilePicture = input.profilePicture;
  if (input.nid) updateData.nid = input.nid;
  if (input.role) {
    updateData.role = input.role;
    // No action assignment here since "promoted"/"demoted" are not allowed values
  }
  if (input.messId) updateData.messId = new Types.ObjectId(input.messId);
  if (typeof input.balance === "number") updateData.balance = input.balance;
  if (typeof input.isVerified === "boolean") {
    updateData.isVerified = input.isVerified;
    activityLog.action = input.isVerified ? "approved" : "rejected";
  }
  if (typeof input.isBlocked === "boolean") {
    updateData.isBlocked = input.isBlocked;
    activityLog.action = input.isBlocked ? "blocked" : "unblocked";
  }
  if (typeof input.isApproved === "boolean") {
    updateData.isApproved = input.isApproved;
    activityLog.action = input.isApproved ? "approved" : "rejected";
  }

  user.set({
    ...updateData,
    activityLogs: [...user.activityLogs, activityLog],
  });

  await user.save();
  return user;
};

// Update user password
export const updatePassword = async (
  userId: string,
  newPassword: string
): Promise<void> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_ID");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  user.password = newPassword;
  await user.save();
};

// Soft delete user
export const softDeleteUser = async (
  userId: string,
  deletedBy: { name: string; managerId: string }
): Promise<void> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_ID");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  user.set({
    isBlocked: true,
    activityLogs: [
      ...user.activityLogs,
      {
        action: "blocked",
        performedBy: {
          name: deletedBy.name,
          managerId: new Types.ObjectId(deletedBy.managerId),
        },
        timestamp: new Date(),
      },
    ],
  });

  await user.save();
};

// Add activity log
export const addActivityLog = async (
  userId: string,
  log: ActivityLogInput
): Promise<void> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_ID");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  user.activityLogs.push({
    action: log.action,
    performedBy: {
      name: log.performedBy.name,
      managerId: new Types.ObjectId(log.performedBy.managerId),
    },
    timestamp: new Date(),
  });

  await user.save();
};
interface JoinMessInput {
  userId: string;
  messId: string;
  performedBy: { name: string; managerId: string };
}

// Interface for approving mess join input
interface ApproveMessJoinInput {
  userId: string;
  performedBy: { name: string; managerId: string };
}

// Join a user to a mess
export const joinMess = async (input: JoinMessInput): Promise<IUser | null> => {
  const { userId, messId, performedBy } = input;

  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  if (!Types.ObjectId.isValid(messId)) {
    throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const mess = await MessModel.findById(messId);
  if (!mess) {
    throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
  }

  if (user.messId && user.messId.toString() === messId) {
    throw new AppError(
      "User is already a member of this mess",
      400,
      "ALREADY_MESS_MEMBER"
    );
  }

  // Update user's messId and set isApproved to false (pending approval)
  user.messId = new Types.ObjectId(messId);
  user.isApproved = false;
  user.activityLogs.push({
    action: "joined_mess",
    performedBy: {
      name: performedBy.name,
      managerId: new Types.ObjectId(performedBy.managerId),
    },
    timestamp: new Date(),
  });

  const savedUser = await user.save();
  return savedUser;
};

// Approve a user's mess join request
export const approveMessJoin = async (
  input: ApproveMessJoinInput
): Promise<void> => {
  const { userId, performedBy } = input;

  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (!user.messId) {
    throw new AppError("User is not associated with a mess", 400, "NO_MESS");
  }

  if (user.isApproved) {
    throw new AppError(
      "User is already an approved member of the mess",
      400,
      "ALREADY_APPROVED"
    );
  }

  // Approve the user
  user.isApproved = true;
  user.activityLogs.push({
    action: "approved",
    performedBy: {
      name: performedBy.name,
      managerId: new Types.ObjectId(performedBy.managerId),
    },
    timestamp: new Date(),
  });

  await user.save();
};
