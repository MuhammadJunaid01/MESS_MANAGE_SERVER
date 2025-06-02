import { Types } from "mongoose";
import { AppError } from "../../middlewares/errors";
import MessModel from "../Mess/mess.schema";
import { UserRole } from "../User/user.interface";
import UserModel from "../User/user.schema";
import SettingModel, { IMSetting } from "./MSetting.schema";

// Interface for setting creation/update input
interface SettingInput {
  messId: Types.ObjectId;
  breakfast?: boolean;
  lunch?: boolean;
  dinner?: boolean;
  memberResponsibleForGrocery?: boolean;
}

// Create a new setting
export const createSetting = async (
  input: SettingInput,
  authUserId: string
): Promise<IMSetting> => {
  if (
    !Types.ObjectId.isValid(input.messId) ||
    !Types.ObjectId.isValid(authUserId)
  ) {
    throw new AppError("Invalid mess or user ID", 400, "INVALID_ID");
  }

  const user = await UserModel.findById(authUserId);
  if (!user || !user.isApproved) {
    throw new AppError("User is not approved", 403, "NOT_APPROVED");
  }

  if (user.role !== UserRole.Admin) {
    throw new AppError("Only admins can create settings", 403, "FORBIDDEN");
  }

  const mess = await MessModel.findById(input.messId);
  if (!mess) {
    throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
  }

  if (!user.messId || user.messId.toString() !== input.messId.toString()) {
    throw new AppError(
      "User is not a member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  const existingSetting = await SettingModel.findOne({
    messId: input.messId,
    isDeleted: false,
  });
  if (existingSetting) {
    throw new AppError(
      "Settings already exist for this mess",
      400,
      "SETTINGS_EXIST"
    );
  }

  const setting = await SettingModel.create({
    messId: new Types.ObjectId(input.messId),
    breakfast: input.breakfast ?? true,
    lunch: input.lunch ?? true,
    dinner: input.dinner ?? true,
    memberResponsibleForGrocery: input.memberResponsibleForGrocery ?? false,
  });

  return setting;
};

// Get setting by messId
export const getSetting = async (
  messId: Types.ObjectId,
  authUserId: Types.ObjectId
): Promise<IMSetting> => {
  if (!Types.ObjectId.isValid(messId) || !Types.ObjectId.isValid(authUserId)) {
    throw new AppError("Invalid mess or user ID", 400, "INVALID_ID");
  }

  const user = await UserModel.findById(authUserId);
  if (!user || !user.isApproved) {
    throw new AppError("User is not approved", 403, "NOT_APPROVED");
  }

  if (!user.messId || user.messId.toString() !== messId.toString()) {
    throw new AppError(
      "User is not a member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  const setting = await SettingModel.findOne({
    messId,
    isDeleted: false,
  }).populate("messId", "name messId");
  if (!setting) {
    throw new AppError(
      "Settings not found for this mess",
      404,
      "SETTINGS_NOT_FOUND"
    );
  }

  return setting;
};

// Update setting
export const updateSetting = async (
  messId: Types.ObjectId,
  input: Partial<SettingInput>,
  authUserId: Types.ObjectId
): Promise<IMSetting> => {
  if (!Types.ObjectId.isValid(messId) || !Types.ObjectId.isValid(authUserId)) {
    throw new AppError("Invalid mess or user ID", 400, "INVALID_ID");
  }

  const user = await UserModel.findById(authUserId);
  if (!user || !user.isApproved) {
    throw new AppError("User is not approved", 403, "NOT_APPROVED");
  }

  if (user.role !== UserRole.Admin || !user.messId) {
    throw new AppError("Only admins can update settings", 403, "FORBIDDEN");
  }

  if (user.messId.toString() !== messId.toString()) {
    throw new AppError(
      "User is not a member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  const setting = await SettingModel.findOne({ messId, isDeleted: false });
  if (!setting) {
    throw new AppError(
      "Settings not found for this mess",
      404,
      "SETTINGS_NOT_FOUND"
    );
  }

  if (input.breakfast !== undefined) setting.breakfast = input.breakfast;
  if (input.lunch !== undefined) setting.lunch = input.lunch;
  if (input.dinner !== undefined) setting.dinner = input.dinner;
  if (input.memberResponsibleForGrocery !== undefined)
    setting.memberResponsibleForGrocery = input.memberResponsibleForGrocery;

  await setting.save();
  return setting;
};
