import { PipelineStage, Types } from "mongoose";
import { AppError } from "../../middlewares/errors";
import { UserRole } from "../User/user.interface";
import UserModel from "../User/user.model";
import { ActivityFilters, IActivityLog } from "./activity.interface";
import ActivityLogModel from "./activity.schema";

// Interface for activity filters

// Get recent activities
export const getRecentActivities = async (
  filters: ActivityFilters,
  authUserId: string
): Promise<IActivityLog[]> => {
  if (!Types.ObjectId.isValid(authUserId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  if (filters.messId && !Types.ObjectId.isValid(filters.messId)) {
    throw new AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
  }

  if (filters.userId && !Types.ObjectId.isValid(filters.userId)) {
    throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
  }

  const user = await UserModel.findById(authUserId);
  if (!user || !user.isApproved) {
    throw new AppError("User is not approved", 403, "NOT_APPROVED");
  }

  // Restrict to user's mess unless Admin/Manager
  const isAdminOrManager = [UserRole.Admin, UserRole.Manager].includes(
    user.role
  );
  if (
    !isAdminOrManager &&
    filters.messId &&
    (!user.messId || filters.messId !== user.messId.toString())
  ) {
    throw new AppError(
      "User is not a member of this mess",
      403,
      "NOT_MESS_MEMBER"
    );
  }

  const match: any = {};
  if (filters.messId) match.messId = new Types.ObjectId(filters.messId);
  if (filters.userId)
    match["performedBy.userId"] = new Types.ObjectId(filters.userId);
  if (filters.action) match.action = filters.action;
  if (filters.entity) match.entity = filters.entity;
  if (filters.dateFrom || filters.dateTo) {
    match.timestamp = {};
    if (filters.dateFrom) match.timestamp.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) match.timestamp.$lte = new Date(filters.dateTo);
  }

  const pipeline: PipelineStage[] = [
    { $match: match },
    {
      $lookup: {
        from: "messes",
        localField: "messId",
        foreignField: "_id",
        as: "mess",
      },
    },
    { $unwind: { path: "$mess", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "performedBy.userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        mess: { _id: "$mess._id", name: "$mess.name", messId: "$mess.messId" },
        entity: 1,
        entityId: 1,
        action: 1,
        performedBy: {
          userId: "$performedBy.userId",
          name: "$performedBy.name",
        },
        timestamp: 1,
        details: 1,
      },
    },
    { $sort: { timestamp: -1 } },
    { $skip: filters.skip || 0 },
    { $limit: filters.limit || 100 },
  ];

  return ActivityLogModel.aggregate(pipeline);
};
