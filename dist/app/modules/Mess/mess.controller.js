"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessController = exports.updateMessController = exports.getMessesController = exports.joinMessController = exports.getUnapprovedUsersController = exports.getMessByIdController = exports.approveMessJoinController = exports.createMessController = void 0;
const mongoose_1 = require("mongoose");
const utils_1 = require("../../lib/utils");
const middlewares_1 = require("../../middlewares");
const errors_1 = require("../../middlewares/errors");
const mess_service_1 = require("./mess.service");
// Create mess
exports.createMessController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, location } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const mess = yield (0, mess_service_1.createMess)({
        name,
        location,
        createdBy: new mongoose_1.Types.ObjectId(authUser.userId),
    });
    (0, utils_1.sendResponse)(res, {
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
}));
// Approve mess join controller
exports.approveMessJoinController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    yield (0, mess_service_1.approveMessJoin)({
        userId,
        performedBy: {
            name: authUser.name,
            managerId: authUser.userId,
        },
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Mess join approved successfully",
        data: null,
    });
}));
// Get mess by ID
exports.getMessByIdController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messId } = req.params;
    const mess = yield (0, mess_service_1.getMessById)(messId);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Mess retrieved successfully",
        data: { mess },
    });
}));
exports.getUnapprovedUsersController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    console.log("HIT");
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const { page = "1", limit = "10", search = "" } = req.query;
    const messId = authUser.messId;
    console.log("messId", messId);
    if (!messId) {
        throw new errors_1.AppError("messId query parameter is required", 400, "BAD_REQUEST");
    }
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const { users, total } = yield (0, mess_service_1.getAllUnapprovedUsers)({
        messId,
        page: pageNum,
        limit: limitNum,
        search: search,
    });
    (0, utils_1.sendResponse)(res, {
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
}));
// Join mess controller
exports.joinMessController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messId } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    yield (0, mess_service_1.joinMess)({
        userId: new mongoose_1.Types.ObjectId(authUser.userId),
        messId: new mongoose_1.Types.ObjectId(messId),
        performedBy: {
            name: authUser.name,
            userId: authUser.userId,
        },
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User joined mess successfully, pending approval",
        data: null,
    });
}));
// Get messes
exports.getMessesController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, createdBy, lat, lon, maxDistance, limit, skip } = req.query;
    const filters = {
        status: status,
        createdBy: createdBy,
        near: lat && lon
            ? {
                lat: Number(lat),
                lon: Number(lon),
                maxDistance: maxDistance ? Number(maxDistance) : undefined,
            }
            : undefined,
        limit: limit ? Number(limit) : undefined,
        skip: skip ? Number(skip) : undefined,
    };
    const messes = yield (0, mess_service_1.getMesses)(filters);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Messes retrieved successfully",
        data: { messes },
    });
}));
// Update mess
exports.updateMessController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messId } = req.params;
    const { name, location, status } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const mess = yield (0, mess_service_1.updateMess)(messId, { name, location, status }, { name: authUser.name, userId: authUser.userId });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Mess updated successfully",
        data: { mess },
    });
}));
// Soft delete mess
exports.deleteMessController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messId } = req.params;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    yield (0, mess_service_1.softDeleteMess)(messId, {
        name: authUser.name,
        userId: authUser.userId,
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Mess soft deleted successfully",
        data: null,
    });
}));
