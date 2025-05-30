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
exports.softDeleteMess = exports.updateMess = exports.getMesses = exports.getMessById = exports.createMess = void 0;
const mongoose_1 = require("mongoose");
const utils_1 = require("../../lib/utils");
const errors_1 = require("../../middlewares/errors");
const user_model_1 = __importDefault(require("../User/user.model"));
const mess_schema_1 = __importDefault(require("./mess.schema"));
// Create a new mess
const createMess = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, location, createdBy } = input;
    if (!mongoose_1.Types.ObjectId.isValid(createdBy)) {
        throw new errors_1.AppError("Invalid creator ID", 400, "INVALID_USER_ID");
    }
    const user = yield user_model_1.default.findById(createdBy);
    if (!user) {
        throw new errors_1.AppError("Creator not found", 404, "USER_NOT_FOUND");
    }
    const existingMess = yield mess_schema_1.default.findOne({ name });
    if (existingMess) {
        throw new errors_1.AppError("Mess name already exists", 400, "NAME_EXISTS");
    }
    const messId = yield (0, utils_1.getNextMessId)();
    const mess = yield mess_schema_1.default.create({
        messId,
        name,
        location,
        createdBy: new mongoose_1.Types.ObjectId(createdBy),
        activityLogs: [
            {
                action: "created",
                performedBy: {
                    name: user.name,
                    userId: new mongoose_1.Types.ObjectId(createdBy),
                },
                timestamp: new Date(),
            },
        ],
    });
    return mess;
});
exports.createMess = createMess;
// Get mess by ID
const getMessById = (messId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(messId)) {
        throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    const mess = yield mess_schema_1.default.findOne({ _id: messId, isDeleted: false })
        .select("-activityLogs")
        .populate("createdBy", "name email");
    if (!mess) {
        throw new errors_1.AppError("Mess not found", 404, "MESS_NOT_FOUND");
    }
    return mess;
});
exports.getMessById = getMessById;
// Get all messes with filters
const getMesses = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const query = { isDeleted: false };
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.createdBy && mongoose_1.Types.ObjectId.isValid(filters.createdBy)) {
        query.createdBy = new mongoose_1.Types.ObjectId(filters.createdBy);
    }
    let pipeline = mess_schema_1.default.find(query)
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
});
exports.getMesses = getMesses;
// Update mess
const updateMess = (messId, input, updatedBy) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(messId)) {
        throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    if (!mongoose_1.Types.ObjectId.isValid(updatedBy.userId)) {
        throw new errors_1.AppError("Invalid updater ID", 400, "INVALID_USER_ID");
    }
    const mess = yield mess_schema_1.default.findOne({ _id: messId, isDeleted: false });
    if (!mess) {
        throw new errors_1.AppError("Mess not found", 404, "MESS_NOT_FOUND");
    }
    if (input.name && input.name !== mess.name) {
        const existingMess = yield mess_schema_1.default.findOne({ name: input.name });
        if (existingMess) {
            throw new errors_1.AppError("Mess name already exists", 400, "NAME_EXISTS");
        }
    }
    const updateData = {};
    const activityLog = {
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
    if (input.name)
        updateData.name = input.name;
    if (input.location)
        updateData.location = input.location;
    if (input.status)
        updateData.status = input.status;
    mess.set(Object.assign(Object.assign({}, updateData), { updatedBy: new mongoose_1.Types.ObjectId(updatedBy.userId), activityLogs: [
            ...mess.activityLogs,
            {
                action: activityLog.action,
                performedBy: {
                    name: updatedBy.name,
                    userId: new mongoose_1.Types.ObjectId(updatedBy.userId),
                },
                timestamp: new Date(),
            },
        ] }));
    yield mess.save();
    return mess;
});
exports.updateMess = updateMess;
// Soft delete mess
const softDeleteMess = (messId, deletedBy) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(messId)) {
        throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    if (!mongoose_1.Types.ObjectId.isValid(deletedBy.userId)) {
        throw new errors_1.AppError("Invalid deleter ID", 400, "INVALID_USER_ID");
    }
    const mess = yield mess_schema_1.default.findOne({ _id: messId, isDeleted: false });
    if (!mess) {
        throw new errors_1.AppError("Mess not found", 404, "MESS_NOT_FOUND");
    }
    mess.set({
        isDeleted: true,
        updatedBy: new mongoose_1.Types.ObjectId(deletedBy.userId),
        activityLogs: [
            ...mess.activityLogs,
            {
                action: "deleted",
                performedBy: {
                    name: deletedBy.name,
                    userId: new mongoose_1.Types.ObjectId(deletedBy.userId),
                },
                timestamp: new Date(),
            },
        ],
    });
    yield mess.save();
});
exports.softDeleteMess = softDeleteMess;
