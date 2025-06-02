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
exports.approveMessJoin = exports.softDeleteMess = exports.updateMess = exports.getMesses = exports.getMessById = exports.getAllUnapprovedUsers = exports.approveJoiningMess = exports.joinMess = exports.createMess = void 0;
const mongoose_1 = require("mongoose");
const global_interface_1 = require("../../interfaces/global.interface");
const utils_1 = require("../../lib/utils");
const errors_1 = require("../../middlewares/errors");
const activity_schema_1 = __importDefault(require("../Activity/activity.schema"));
const user_schema_1 = __importDefault(require("../User/user.schema"));
const mess_schema_1 = __importDefault(require("./mess.schema"));
// Interface for activity log input
// Create a new mess
const createMess = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, location, createdBy } = input;
    if (!mongoose_1.Types.ObjectId.isValid(createdBy)) {
        throw new errors_1.AppError("Invalid creator ID", 400, "INVALID_USER_ID");
    }
    const session = yield mess_schema_1.default.startSession();
    session.startTransaction();
    try {
        const user = yield user_schema_1.default.findById(createdBy).session(session);
        if (!user) {
            throw new errors_1.AppError("Creator not found", 404, "USER_NOT_FOUND");
        }
        const existingMess = yield mess_schema_1.default.findOne({ name }).session(session);
        if (existingMess) {
            throw new errors_1.AppError("Mess name already exists", 400, "NAME_EXISTS");
        }
        const messId = yield (0, utils_1.getNextMessId)();
        const mess = new mess_schema_1.default({
            messId,
            name,
            location,
            createdBy: new mongoose_1.Types.ObjectId(createdBy),
        });
        const newMess = yield mess.save({ session });
        const activity = new activity_schema_1.default({
            messId: newMess._id,
            entity: "Mess",
            entityId: newMess._id,
            action: global_interface_1.IStatus.Created,
            performedBy: {
                userId: new mongoose_1.Types.ObjectId(createdBy),
                name: user.name,
            },
            timestamp: new Date(),
        });
        yield activity.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return newMess;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.createMess = createMess;
// Join a user to a mess
const joinMess = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        const { userId, messId, performedBy } = input;
        console.log("performedBy", performedBy);
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
        }
        if (!mongoose_1.Types.ObjectId.isValid(messId)) {
            throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
        }
        const user = yield user_schema_1.default.findById(userId).session(session);
        if (!user) {
            throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
        }
        const mess = yield mess_schema_1.default.findById(messId).session(session);
        if (!mess) {
            throw new errors_1.AppError("Mess not found", 404, "MESS_NOT_FOUND");
        }
        if (user.messId && user.messId.toString() === messId.toString()) {
            throw new errors_1.AppError("User is already a member of this mess", 400, "ALREADY_MESS_MEMBER");
        }
        // Update user's messId and set isApproved to false (pending approval)
        user.messId = new mongoose_1.Types.ObjectId(messId);
        user.isApproved = false;
        const activity = new activity_schema_1.default({
            action: global_interface_1.IStatus.JoinMess,
            messId: mess._id,
            performedBy: {
                name: performedBy.name,
                userId: new mongoose_1.Types.ObjectId(performedBy.userId),
            },
            timestamp: new Date(),
            entity: "User",
            entityId: user._id,
        });
        yield activity.save({ session });
        // Save the updated user
        const savedUser = yield user.save({ session });
        yield session.commitTransaction();
        return savedUser;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.joinMess = joinMess;
const approveJoiningMess = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        const { userId, messId, performedBy } = input;
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
        }
        if (!mongoose_1.Types.ObjectId.isValid(messId)) {
            throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
        }
        // Find user with session
        const user = yield user_schema_1.default.findById(userId).session(session);
        if (!user) {
            throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
        }
        // Check if user is actually waiting for approval for this mess
        if (!user.messId || user.messId.toString() !== messId.toString()) {
            throw new errors_1.AppError("User is not joining this mess or mess ID mismatch", 400, "INVALID_MEMBERSHIP");
        }
        // check status
        if (user.isApproved) {
            throw new errors_1.AppError("User is already approved", 400, "ALREADY_APPROVED");
        }
        // Approve user by setting isApproved to true
        user.isApproved = true;
        // Log the approval activity
        const activity = new activity_schema_1.default({
            action: global_interface_1.IStatus.Approved,
            messId: messId,
            performedBy: {
                name: performedBy.name,
                userId: new mongoose_1.Types.ObjectId(performedBy.userId),
            },
            timestamp: new Date(),
            entity: "User",
            entityId: user._id,
        });
        // Save both documents inside the session transaction
        yield activity.save({ session });
        const savedUser = yield user.save({ session });
        // Commit the transaction
        yield session.commitTransaction();
        return savedUser;
    }
    catch (error) {
        // Abort transaction if error occurs
        yield session.abortTransaction();
        throw error;
    }
    finally {
        // End the session in all cases
        session.endSession();
    }
});
exports.approveJoiningMess = approveJoiningMess;
const getAllUnapprovedUsers = (_a) => __awaiter(void 0, [_a], void 0, function* ({ messId, page = 1, limit = 10, search = "", }) {
    const filter = {
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
    const total = yield user_schema_1.default.countDocuments(filter);
    // Get paginated users
    const users = yield user_schema_1.default.find(filter).skip(skip).limit(limit).exec();
    return { users, total };
});
exports.getAllUnapprovedUsers = getAllUnapprovedUsers;
// Get mess by ID
const getMessById = (messId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(messId)) {
        throw new errors_1.AppError("Invalid mess ID", 400, "INVALID_MESS_ID");
    }
    const mess = yield mess_schema_1.default.findOne({
        _id: messId,
        isDeleted: false,
    }).populate("createdBy", "name email");
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
    const session = yield mess_schema_1.default.startSession();
    session.startTransaction();
    try {
        const mess = yield mess_schema_1.default.findOne({
            _id: messId,
            isDeleted: false,
        }).session(session);
        if (!mess) {
            throw new errors_1.AppError("Mess not found", 404, "MESS_NOT_FOUND");
        }
        if (input.name && input.name !== mess.name) {
            const existingMess = yield mess_schema_1.default.findOne({
                name: input.name,
            }).session(session);
            if (existingMess) {
                throw new errors_1.AppError("Mess name already exists", 400, "NAME_EXISTS");
            }
        }
        const updateData = {};
        if (input.name)
            updateData.name = input.name;
        if (input.location)
            updateData.location = input.location;
        if (input.status)
            updateData.status = input.status;
        Object.assign(mess, updateData);
        yield mess.save({ session });
        const activity = new activity_schema_1.default({
            messId: mess._id,
            entity: "Mess",
            entityId: mess._id,
            action: global_interface_1.IStatus.Updated,
            performedBy: {
                userId: new mongoose_1.Types.ObjectId(updatedBy.userId),
                name: updatedBy.name,
            },
            timestamp: new Date(),
        });
        yield activity.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return mess;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.updateMess = updateMess;
// Soft delete mess
const softDeleteMess = (messId, deletedBy) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
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
        yield mess.save({ session });
        const activity = new activity_schema_1.default({
            messId: mess._id,
            entity: "Mess",
            entityId: mess._id,
            action: global_interface_1.IStatus.Deleted,
            performedBy: {
                userId: new mongoose_1.Types.ObjectId(deletedBy.userId),
                name: deletedBy.name,
            },
            timestamp: new Date(),
        });
        yield activity.save({ session });
        yield session.commitTransaction();
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.softDeleteMess = softDeleteMess;
// Approve a user's mess join request
const approveMessJoin = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, performedBy } = input;
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_USER_ID");
    }
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        const user = yield user_schema_1.default.findById(userId).session(session);
        if (!user) {
            throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
        }
        if (!user.messId) {
            throw new errors_1.AppError("User is not associated with a mess", 400, "NO_MESS");
        }
        if (user.isApproved) {
            throw new errors_1.AppError("User is already an approved member of the mess", 400, "ALREADY_APPROVED");
        }
        // Approve the user
        user.isApproved = true;
        const activity = new activity_schema_1.default({
            action: global_interface_1.IStatus.Approved,
            messId: user.messId,
            performedBy: {
                name: performedBy.name,
                userId: new mongoose_1.Types.ObjectId(performedBy.managerId),
            },
            timestamp: new Date(),
            entity: "User",
            entityId: user._id,
        });
        yield activity.save({ session });
        yield user.save({ session });
        yield session.commitTransaction();
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
exports.approveMessJoin = approveMessJoin;
