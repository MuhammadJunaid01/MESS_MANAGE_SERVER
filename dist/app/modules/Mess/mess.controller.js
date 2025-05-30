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
exports.deleteMessController = exports.updateMessController = exports.getMessesController = exports.getMessByIdController = exports.createMessController = void 0;
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
        createdBy: authUser._id,
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
    const mess = yield (0, mess_service_1.updateMess)(messId, { name, location, status }, { name: authUser.name, userId: authUser._id });
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
    yield (0, mess_service_1.softDeleteMess)(messId, { name: authUser.name, userId: authUser._id });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Mess soft deleted successfully",
        data: null,
    });
}));
