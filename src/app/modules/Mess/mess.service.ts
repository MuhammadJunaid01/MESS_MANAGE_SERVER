import { startSession, Types } from "mongoose";
import { ILocation, IStatus } from "../../interfaces/global.interface";
import { getNextMessId } from "../../lib/utils";
import { AppError } from "../../middlewares/errors";
import ActivityLogModel from "../Activity/activity.schema";
import { IUser } from "../User/user.interface";
import UserModel from "../User/user.schema";
import { IMess } from "./mess.interface";
import MessModel from "./mess.schema";
interface GetUnapprovedUsersOptions {
  messId: Types.ObjectId;
  page?: number;
  limit?: number;
  search?: string;
}
interface ApproveMessJoinInput {
  userId: string;
  performedBy: { name: string; managerId: string };
}

interface JoinMessInput {
  userId: Types.ObjectId;
  messId: Types.ObjectId;
  performedBy: { name: string; userId: string };
}

// Interface for mess creation input
interface CreateMessInput {
  name: string;
  location: ILocation;
  createdBy: Types.ObjectId;
}

// Interface for mess update input
interface UpdateMessInput {
  name?: string;
  location?: ILocation;
  status?: "active" | "inactive";
}

// Interface for activity log input

// Create a new mess
export const createMess = async (input: CreateMessInput): Promise<IMess> => {
  const { name, location, createdBy } = input;

  if (!Types.ObjectId.isValid(createdBy)) {
    throw new AppError("Invalid creator ID", 400, "INVALID_USER_ID");
  }

  const session = await MessModel.startSession();
  session.startTransaction();

  try {
    const user = await UserModel.findById(createdBy).session(session);
    if (!user) {
      throw new AppError("Creator not found", 404, "USER_NOT_FOUND");
    }

    const existingMess = await MessModel.findOne({ name }).session(session);
    if (existingMess) {
      throw new AppError("Mess name already exists", 400, "NAME_EXISTS");
    }

    const messId = await getNextMessId();

    const mess = new MessModel({
      messId,
      name,
      location,
      createdBy: new Types.ObjectId(createdBy),
    });

    const newMess = await mess.save({ session });

    const activity = new ActivityLogModel({
      messId: newMess._id,
      entity: "Mess",
      entityId: newMess._id,
      action: IStatus.Created,
      performedBy: {
        userId: new Types.ObjectId(createdBy),
        name: user.name,
      },
      timestamp: new Date(),
    });

    await activity.save({ session });

    await session.commitTransaction();
    session.endSession();

    return newMess;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
// Join a user to a mess
export const joinMess = async (input: JoinMessInput): Promise<IUser | null> => {
  const session = await startSession();
  session.startTransaction();
  try {
    const { userId, messId, performedBy } = input;
    console.log("performedBy", performedBy);
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }

    if (!Types.ObjectId.isValid(messId)) {
      throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const mess = await MessModel.findById(messId).session(session);
    if (!mess) {
      throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
    }

    if (user.messId && user.messId.toString() === messId.toString()) {
      throw new AppError(
        "User is already a member of this mess",
        400,
        "ALREADY_MESS_MEMBER"
      );
    }

    // Update user's messId and set isApproved to false (pending approval)
    user.messId = new Types.ObjectId(messId);
    user.isApproved = false;

    const activity = new ActivityLogModel({
      action: IStatus.JoinMess,
      messId: mess._id,
      performedBy: {
        name: performedBy.name,
        userId: new Types.ObjectId(performedBy.userId),
      },
      timestamp: new Date(),
      entity: "User",
      entityId: user._id,
    });
    await activity.save({ session });
    // Save the updated user

    const savedUser = await user.save({ session });
    await session.commitTransaction();
    return savedUser;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
export const approveJoiningMess = async (
  input: JoinMessInput
): Promise<IUser | null> => {
  const session = await startSession();

  try {
    session.startTransaction();

    const { userId, messId, performedBy } = input;

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }

    if (!Types.ObjectId.isValid(messId)) {
      throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }

    // Find user with session
    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    // Check if user is actually waiting for approval for this mess
    if (!user.messId || user.messId.toString() !== messId.toString()) {
      throw new AppError(
        "User is not joining this mess or mess ID mismatch",
        400,
        "INVALID_MEMBERSHIP"
      );
    }
    // check status
    if (user.isApproved) {
      throw new AppError("User is already approved", 400, "ALREADY_APPROVED");
    }
    // Approve user by setting isApproved to true
    user.isApproved = true;

    // Log the approval activity
    const activity = new ActivityLogModel({
      action: IStatus.Approved,
      messId: messId,
      performedBy: {
        name: performedBy.name,
        userId: new Types.ObjectId(performedBy.userId),
      },
      timestamp: new Date(),
      entity: "User",
      entityId: user._id,
    });

    // Save both documents inside the session transaction
    await activity.save({ session });
    const savedUser = await user.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    return savedUser;
  } catch (error) {
    // Abort transaction if error occurs
    await session.abortTransaction();
    throw error;
  } finally {
    // End the session in all cases
    session.endSession();
  }
};

export const getAllUnapprovedUsers = async ({
  messId,
  page = 1,
  limit = 10,
  search = "",
}: GetUnapprovedUsersOptions): Promise<{ users: IUser[]; total: number }> => {
  const filter: any = {
    messId: messId,
    isApproved: false,
  };
  console.log("HIT HIT HIT");
  if (search.trim()) {
    // Simple case-insensitive search on name or email (adjust fields as needed)
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  // Get total count for pagination meta
  const total = await UserModel.countDocuments(filter);

  // Get paginated users
  const users = await UserModel.find(filter).skip(skip).limit(limit).exec();

  return { users, total };
};
// Get mess by ID
export const getMessById = async (messId: string): Promise<IMess> => {
  if (!Types.ObjectId.isValid(messId)) {
    throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
  }

  const mess = await MessModel.findOne({
    _id: messId,
    isDeleted: false,
  }).populate("createdBy", "name email");
  if (!mess) {
    throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
  }

  return mess;
};

// Get all messes with filters
export const getMesses = async (
  filters: {
    status?: "active" | "inactive";
    createdBy?: string;
    near?: { lat: number; lon: number; maxDistance?: number };
    limit?: number;
    skip?: number;
  } = {}
): Promise<IMess[]> => {
  const query: any = { isDeleted: false };

  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.createdBy && Types.ObjectId.isValid(filters.createdBy)) {
    query.createdBy = new Types.ObjectId(filters.createdBy);
  }

  let pipeline = MessModel.find(query)
    .select("-activityLogs")
    .populate("createdBy", "name email");

  if (filters.near) {
    const { lat, lon, maxDistance = 5000 } = filters.near; // Default 5km
    pipeline = pipeline.where("location.coordinates").near({
      center: [lon, lat],
      maxDistance, // in meters
      spherical: true,
    });
  }

  return pipeline
    .limit(filters.limit || 100)
    .skip(filters.skip || 0)
    .sort({ messId: 1 }); // Sort by messId for consistency
};

// Update mess
export const updateMess = async (
  messId: string,
  input: UpdateMessInput,
  updatedBy: { name: string; userId: string }
): Promise<IMess> => {
  if (!Types.ObjectId.isValid(messId)) {
    throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
  }

  if (!Types.ObjectId.isValid(updatedBy.userId)) {
    throw new AppError("Invalid updater ID", 400, "INVALID_USER_ID");
  }

  const session = await MessModel.startSession();
  session.startTransaction();

  try {
    const mess = await MessModel.findOne({
      _id: messId,
      isDeleted: false,
    }).session(session);
    if (!mess) {
      throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
    }

    if (input.name && input.name !== mess.name) {
      const existingMess = await MessModel.findOne({
        name: input.name,
      }).session(session);
      if (existingMess) {
        throw new AppError("Mess name already exists", 400, "NAME_EXISTS");
      }
    }

    const updateData: Partial<IMess> = {};
    if (input.name) updateData.name = input.name;
    if (input.location) updateData.location = input.location;
    if (input.status) updateData.status = input.status;

    Object.assign(mess, updateData);
    await mess.save({ session });

    const activity = new ActivityLogModel({
      messId: mess._id,
      entity: "Mess",
      entityId: mess._id,
      action: IStatus.Updated,
      performedBy: {
        userId: new Types.ObjectId(updatedBy.userId),
        name: updatedBy.name,
      },
      timestamp: new Date(),
    });
    await activity.save({ session });

    await session.commitTransaction();
    session.endSession();
    return mess;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Soft delete mess
export const softDeleteMess = async (
  messId: string,
  deletedBy: { name: string; userId: string }
): Promise<void> => {
  const session = await startSession();
  try {
    session.startTransaction();

    if (!Types.ObjectId.isValid(messId)) {
      throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }

    if (!Types.ObjectId.isValid(deletedBy.userId)) {
      throw new AppError("Invalid deleter ID", 400, "INVALID_USER_ID");
    }

    const mess = await MessModel.findOne({ _id: messId, isDeleted: false });
    if (!mess) {
      throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
    }

    await mess.save({ session });
    const activity = new ActivityLogModel({
      messId: mess._id,
      entity: "Mess",
      entityId: mess._id,
      action: IStatus.Deleted,
      performedBy: {
        userId: new Types.ObjectId(deletedBy.userId),
        name: deletedBy.name,
      },
      timestamp: new Date(),
    });
    await activity.save({ session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
// Approve a user's mess join request
export const approveMessJoin = async (
  input: ApproveMessJoinInput
): Promise<void> => {
  const { userId, performedBy } = input;

  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  const session = await startSession();
  try {
    session.startTransaction();

    const user = await UserModel.findById(userId).session(session);
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

    const activity = new ActivityLogModel({
      action: IStatus.Approved,
      messId: user.messId,
      performedBy: {
        name: performedBy.name,
        userId: new Types.ObjectId(performedBy.managerId),
      },
      timestamp: new Date(),
      entity: "User",
      entityId: user._id,
    });

    await activity.save({ session });
    await user.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
