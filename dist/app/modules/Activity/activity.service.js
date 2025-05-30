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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivities = void 0;
const mongoose_1 = require("mongoose");
const errors_1 = require("../../middlewares/errors");
const user_interface_1 = require("../User/user.interface");
const user_model_1 = __importDefault(require("../User/user.model"));
const activity_schema_1 = __importDefault(require("./activity.schema"));
// Interface for activity filters
// Get recent activities
const getRecentActivities = (filters, authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(authUserId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    if (filters.messId && !mongoose_1.Types.ObjectId.isValid(filters.messId)) {
        throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    if (filters.userId && !mongoose_1.Types.ObjectId.isValid(filters.userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    const user = yield user_model_1.default.findById(authUserId);
    if (!user || !user.isApproved) {
        throw new errors_1.AppError("User is not approved", 403, "NOT_APPROVED");
    }
    // Restrict to user's mess unless Admin/Manager
    const isAdminOrManager = [user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager].includes(user.role);
    if (!isAdminOrManager &&
        filters.messId &&
        (!user.messId || filters.messId !== user.messId.toString())) {
        throw new errors_1.AppError("User is not a member of this mess", 403, "NOT_MESS_MEMBER");
    }
    const match = {};
    if (filters.messId)
        match.messId = new mongoose_1.Types.ObjectId(filters.messId);
    if (filters.userId)
        match["performedBy.userId"] = new mongoose_1.Types.ObjectId(filters.userId);
    if (filters.action)
        match.action = filters.action;
    if (filters.entity)
        match.entity = filters.entity;
    if (filters.dateFrom || filters.dateTo) {
        match.timestamp = {};
        if (filters.dateFrom)
            match.timestamp.$gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            match.timestamp.$lte = new Date(filters.dateTo);
    }
    const pipeline = [
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
    return activity_schema_1.default.aggregate(pipeline);
});
exports.getRecentActivities = getRecentActivities;
