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
exports.updateSettingController = exports.getSettingController = exports.createSettingController = void 0;
const mongoose_1 = require("mongoose");
const utils_1 = require("../../lib/utils");
const middlewares_1 = require("../../middlewares");
const errors_1 = require("../../middlewares/errors");
const MSetting_service_1 = require("./MSetting.service");
// Create a new setting
exports.createSettingController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { breakfast, lunch, dinner, memberResponsibleForGrocery } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const userId = new mongoose_1.Types.ObjectId(authUser.userId);
    const messId = new mongoose_1.Types.ObjectId(authUser.messId);
    if (!messId || !userId) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const setting = yield (0, MSetting_service_1.createSetting)({
        messId,
        breakfast,
        lunch,
        dinner,
        memberResponsibleForGrocery,
    }, authUser.userId);
    (0, utils_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Setting created successfully",
        data: { setting },
    });
}));
// Get setting by messId
exports.getSettingController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const userId = new mongoose_1.Types.ObjectId(authUser.userId);
    const messId = new mongoose_1.Types.ObjectId(authUser.messId);
    if (!messId || !userId) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const setting = yield (0, MSetting_service_1.getSetting)(messId, userId);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Setting retrieved successfully",
        data: { setting },
    });
}));
// Update setting
exports.updateSettingController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { breakfast, lunch, dinner, memberResponsibleForGrocery } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const userId = new mongoose_1.Types.ObjectId(authUser.userId);
    const messId = new mongoose_1.Types.ObjectId(authUser.messId);
    if (!messId || !userId) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const setting = yield (0, MSetting_service_1.updateSetting)(messId, {
        breakfast,
        lunch,
        dinner,
        memberResponsibleForGrocery,
    }, userId);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Setting updated successfully",
        data: { setting },
    });
}));
