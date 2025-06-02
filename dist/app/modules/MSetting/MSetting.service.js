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
exports.updateSetting = exports.getSetting = exports.createSetting = void 0;
const mongoose_1 = require("mongoose");
const errors_1 = require("../../middlewares/errors");
const mess_schema_1 = __importDefault(require("../Mess/mess.schema"));
const user_interface_1 = require("../User/user.interface");
const user_schema_1 = __importDefault(require("../User/user.schema"));
const MSetting_schema_1 = __importDefault(require("./MSetting.schema"));
// Create a new setting
const createSetting = (input, authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        if (!mongoose_1.Types.ObjectId.isValid(input.messId) ||
            !mongoose_1.Types.ObjectId.isValid(authUserId)) {
            throw new errors_1.AppError("Invalid mess or user ID", 400, "INVALID_ID");
        }
        const user = yield user_schema_1.default.findById(authUserId).session(session);
        if (!user || !user.isApproved) {
            throw new errors_1.AppError("User is not approved", 403, "NOT_APPROVED");
        }
        // if (user.role !== UserRole.Admin) {
        //   throw new AppError("Only admins can create settings", 403, "FORBIDDEN");
        // }
        const mess = yield mess_schema_1.default.findById(input.messId).session(session);
        if (!mess) {
            throw new errors_1.AppError("Mess not found", 404, "MESS_NOT_FOUND");
        }
        if (!user.messId || user.messId.toString() !== input.messId.toString()) {
            throw new errors_1.AppError("User is not a member of this mess", 403, "NOT_MESS_MEMBER");
        }
        const existingSetting = yield MSetting_schema_1.default.findOne({
            messId: input.messId,
            isDeleted: false,
        }).session(session);
        if (existingSetting) {
            throw new errors_1.AppError("Settings already exist for this mess", 400, "SETTINGS_EXIST");
        }
        const setting = new MSetting_schema_1.default({
            messId: new mongoose_1.Types.ObjectId(input.messId),
            breakfast: (_a = input.breakfast) !== null && _a !== void 0 ? _a : true,
            lunch: (_b = input.lunch) !== null && _b !== void 0 ? _b : true,
            dinner: (_c = input.dinner) !== null && _c !== void 0 ? _c : true,
            memberResponsibleForGrocery: (_d = input.memberResponsibleForGrocery) !== null && _d !== void 0 ? _d : false,
        });
        const newSetting = yield setting.save({ session });
        yield session.commitTransaction();
        return newSetting;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
exports.createSetting = createSetting;
// Get setting by messId
const getSetting = (messId, authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(messId) || !mongoose_1.Types.ObjectId.isValid(authUserId)) {
        throw new errors_1.AppError("Invalid mess or user ID", 400, "INVALID_ID");
    }
    const user = yield user_schema_1.default.findById(authUserId);
    if (!user || !user.isApproved) {
        throw new errors_1.AppError("User is not approved", 403, "NOT_APPROVED");
    }
    if (!user.messId || user.messId.toString() !== messId.toString()) {
        throw new errors_1.AppError("User is not a member of this mess", 403, "NOT_MESS_MEMBER");
    }
    const setting = yield MSetting_schema_1.default.findOne({
        messId,
        isDeleted: false,
    }).populate("messId", "name messId");
    if (!setting) {
        throw new errors_1.AppError("Settings not found for this mess", 404, "SETTINGS_NOT_FOUND");
    }
    return setting;
});
exports.getSetting = getSetting;
// Update setting
const updateSetting = (messId, input, authUserId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(messId) || !mongoose_1.Types.ObjectId.isValid(authUserId)) {
        throw new errors_1.AppError("Invalid mess or user ID", 400, "INVALID_ID");
    }
    const user = yield user_schema_1.default.findById(authUserId);
    if (!user || !user.isApproved) {
        throw new errors_1.AppError("User is not approved", 403, "NOT_APPROVED");
    }
    if (user.role !== user_interface_1.UserRole.Admin || !user.messId) {
        throw new errors_1.AppError("Only admins can update settings", 403, "FORBIDDEN");
    }
    if (user.messId.toString() !== messId.toString()) {
        throw new errors_1.AppError("User is not a member of this mess", 403, "NOT_MESS_MEMBER");
    }
    const setting = yield MSetting_schema_1.default.findOne({ messId, isDeleted: false });
    if (!setting) {
        throw new errors_1.AppError("Settings not found for this mess", 404, "SETTINGS_NOT_FOUND");
    }
    if (input.breakfast !== undefined)
        setting.breakfast = input.breakfast;
    if (input.lunch !== undefined)
        setting.lunch = input.lunch;
    if (input.dinner !== undefined)
        setting.dinner = input.dinner;
    if (input.memberResponsibleForGrocery !== undefined)
        setting.memberResponsibleForGrocery = input.memberResponsibleForGrocery;
    yield setting.save();
    return setting;
});
exports.updateSetting = updateSetting;
