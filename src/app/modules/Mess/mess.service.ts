import { Types } from "mongoose";
import { ILocation } from "../../interfaces";
import { getNextMessId } from "../../lib/utils";
import { AppError } from "../../middlewares/errors";
import UserModel from "../User/user.model";
import { IMess } from "./mess.interface";
import MessModel from "./mess.schema";

// Interface for mess creation input
interface CreateMessInput {
  name: string;
  location: ILocation;
  createdBy: string;
}

// Interface for mess update input
interface UpdateMessInput {
  name?: string;
  location?: ILocation;
  status?: "active" | "inactive";
}

// Interface for activity log input
interface ActivityLogInput {
  action: "created" | "updated" | "deleted" | "activated" | "deactivated";
  performedBy: {
    name: string;
    userId: string;
  };
}

// Create a new mess
export const createMess = async (input: CreateMessInput): Promise<IMess> => {
  const { name, location, createdBy } = input;

  if (!Types.ObjectId.isValid(createdBy)) {
    throw new AppError("Invalid creator ID", 400, "INVALID_USER_ID");
  }

  const user = await UserModel.findById(createdBy);
  if (!user) {
    throw new AppError("Creator not found", 404, "USER_NOT_FOUND");
  }

  const existingMess = await MessModel.findOne({ name });
  if (existingMess) {
    throw new AppError("Mess name already exists", 400, "NAME_EXISTS");
  }

  const messId = await getNextMessId();

  const mess = await MessModel.create({
    messId,
    name,
    location,
    createdBy: new Types.ObjectId(createdBy),
    activityLogs: [
      {
        action: "created",
        performedBy: {
          name: user.name,
          userId: new Types.ObjectId(createdBy),
        },
        timestamp: new Date(),
      },
    ],
  });

  return mess;
};

// Get mess by ID
export const getMessById = async (messId: string): Promise<IMess> => {
  if (!Types.ObjectId.isValid(messId)) {
    throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
  }

  const mess = await MessModel.findOne({ _id: messId, isDeleted: false })
    .select("-activityLogs")
    .populate("createdBy", "name email");
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

  const mess = await MessModel.findOne({ _id: messId, isDeleted: false });
  if (!mess) {
    throw new AppError("Mess not found", 404, "MESS_NOT_FOUND");
  }

  if (input.name && input.name !== mess.name) {
    const existingMess = await MessModel.findOne({ name: input.name });
    if (existingMess) {
      throw new AppError("Mess name already exists", 400, "NAME_EXISTS");
    }
  }

  const updateData: Partial<IMess> = {};
  const activityLog: ActivityLogInput = {
    action: input.status
      ? input.status === "active"
        ? "activated"
        : "deactivated"
      : "updated",
    performedBy: {
      name: updatedBy.name,
      userId: updatedBy.userId,
    },
  };

  if (input.name) updateData.name = input.name;
  if (input.location) updateData.location = input.location;
  if (input.status) updateData.status = input.status;

  mess.set({
    ...updateData,
    updatedBy: new Types.ObjectId(updatedBy.userId),
    activityLogs: [
      ...mess.activityLogs,
      {
        action: activityLog.action,
        performedBy: {
          name: updatedBy.name,
          userId: new Types.ObjectId(updatedBy.userId),
        },
        timestamp: new Date(),
      },
    ],
  });

  await mess.save();
  return mess;
};

// Soft delete mess
export const softDeleteMess = async (
  messId: string,
  deletedBy: { name: string; userId: string }
): Promise<void> => {
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

  mess.set({
    isDeleted: true,
    updatedBy: new Types.ObjectId(deletedBy.userId),
    activityLogs: [
      ...mess.activityLogs,
      {
        action: "deleted",
        performedBy: {
          name: deletedBy.name,
          userId: new Types.ObjectId(deletedBy.userId),
        },
        timestamp: new Date(),
      },
    ],
  });

  await mess.save();
};
