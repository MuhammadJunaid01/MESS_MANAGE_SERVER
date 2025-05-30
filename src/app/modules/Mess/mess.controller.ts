import { NextFunction, Request, Response } from "express";
import { AuthUser } from "../../interfaces";
import { sendResponse } from "../../lib/utils";
import { catchAsync } from "../../middlewares";
import { AppError } from "../../middlewares/errors";
import {
  createMess,
  getMessById,
  getMesses,
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
      createdBy: authUser._id,
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
      { name: authUser.name, userId: authUser._id }
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

    await softDeleteMess(messId, { name: authUser.name, userId: authUser._id });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Mess soft deleted successfully",
      data: null,
    });
  }
);
