import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { AuthUser } from "../../interfaces/global.interface";
import { sendResponse } from "../../lib/utils";
import { catchAsync } from "../../middlewares";
import { AppError } from "../../middlewares/errors";
import {
  approveMessJoin,
  createMess,
  getAllUnapprovedUsers,
  getMessById,
  getMesses,
  joinMess,
  softDeleteMess,
  updateMess,
} from "./mess.service";

// Create mess
export const createMessController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, location } = req.body;
    const authUser = req.user;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const mess = await createMess({
      name,
      location,
      createdBy: new Types.ObjectId(authUser.userId),
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Mess created successfully",
      data: {
        mess: {
          _id: mess._id,
          messId: mess.messId,
          name: mess.name,
          location: mess.location,
        },
      },
    });
  }
);
// Approve mess join controller
export const approveMessJoinController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const authUser = req.user as AuthUser | undefined;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    await approveMessJoin({
      userId,
      performedBy: {
        name: authUser.name,
        managerId: authUser.userId,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Mess join approved successfully",
      data: null,
    });
  }
);
// Get mess by ID
export const getMessByIdController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { messId } = req.params;

    const mess = await getMessById(messId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Mess retrieved successfully",
      data: { mess },
    });
  }
);
export const getUnapprovedUsersController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.user as AuthUser | undefined;
    console.log("HIT");
    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }
    const { page = "1", limit = "10", search = "" } = req.query;
    const messId = authUser.messId;
    console.log("messId", messId);
    if (!messId) {
      throw new AppError(
        "messId query parameter is required",
        400,
        "BAD_REQUEST"
      );
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const { users, total } = await getAllUnapprovedUsers({
      messId,
      page: pageNum,
      limit: limitNum,
      search: search as string,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Unapproved users fetched successfully",
      data: users,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }
);
// Join mess controller
export const joinMessController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { messId } = req.body;
    const authUser = req.user as AuthUser | undefined;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    await joinMess({
      userId: new Types.ObjectId(authUser.userId),
      messId: new Types.ObjectId(messId),
      performedBy: {
        name: authUser.name,
        userId: authUser.userId,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User joined mess successfully, pending approval",
      data: null,
    });
  }
);
// Get messes
export const getMessesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status, createdBy, lat, lon, maxDistance, limit, skip } = req.query;

    const filters = {
      status: status as "active" | "inactive" | undefined,
      createdBy: createdBy as string | undefined,
      near:
        lat && lon
          ? {
              lat: Number(lat),
              lon: Number(lon),
              maxDistance: maxDistance ? Number(maxDistance) : undefined,
            }
          : undefined,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
    };

    const messes = await getMesses(filters);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Messes retrieved successfully",
      data: { messes },
    });
  }
);

// Update mess
export const updateMessController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { messId } = req.params;
    const { name, location, status } = req.body;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    const mess = await updateMess(
      messId,
      { name, location, status },
      { name: authUser.name, userId: authUser.userId }
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Mess updated successfully",
      data: { mess },
    });
  }
);

// Soft delete mess
export const deleteMessController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { messId } = req.params;
    const authUser = req.user as AuthUser;

    if (!authUser) {
      throw new AppError(
        "Unauthorized: No authenticated user",
        401,
        "UNAUTHORIZED"
      );
    }

    await softDeleteMess(messId, {
      name: authUser.name,
      userId: authUser.userId,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Mess soft deleted successfully",
      data: null,
    });
  }
);
