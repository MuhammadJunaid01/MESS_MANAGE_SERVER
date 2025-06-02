import { Types } from "mongoose";

export interface IMSetting extends Document {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  memberResponsibleForGrocery: boolean;
  messId: Types.ObjectId;
  isDeleted: boolean;
}
