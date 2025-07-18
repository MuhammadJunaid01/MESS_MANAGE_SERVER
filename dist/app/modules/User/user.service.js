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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addActivityLog = exports.softDeleteUser = exports.updatePassword = exports.updateUser = exports.getUsers = exports.getUserByEmail = exports.getUserById = exports.createUser = exports.resetPassword = exports.forgotPassword = exports.verifyOtp = exports.signIn = exports.signUpUser = void 0;
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../../config"));
const builder_1 = require("../../lib/builder");
const sendEmail_1 = require("../../lib/utils/sendEmail");
const errors_1 = require("../../middlewares/errors");
const activity_schema_1 = __importDefault(require("../Activity/activity.schema"));
const user_interface_1 = require("./user.interface");
const user_schema_1 = __importDefault(require("./user.schema"));
// Generate a 6-digit OTP
const generateOtp = () => {
    return crypto_1.default.randomInt(100000, 999999).toString().padStart(6, "0");
};
// Generate a reset token
const generateResetToken = () => {
    return crypto_1.default.randomBytes(32).toString("hex");
};
// Sign up a new user and send OTP
const signUpUser = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role = user_interface_1.UserRole.Viewer, messId } = input, rest = __rest(input, ["email", "password", "role", "messId"]);
    // Check if email already exists
    const existingUser = yield user_schema_1.default.findOne({ email });
    if (existingUser) {
        throw new errors_1.AppError("Email already exists", 400, "EMAIL_EXISTS");
    }
    // Generate OTP and expiration
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    // Convert messId to ObjectId if provided
    const userData = Object.assign(Object.assign(Object.assign(Object.assign({}, rest), { email: email.toLowerCase(), password, // Will be hashed by pre-save middleware
        role }), (messId && { messId: new mongoose_1.Types.ObjectId(messId) })), { balance: 0, isVerified: false, isBlocked: false, isApproved: false, otp,
        otpExpires });
    const user = yield user_schema_1.default.create(userData);
    // Send OTP email
    try {
        yield (0, sendEmail_1.sendOtpEmail)(user.email, otp, user.name, "10 minutes");
    }
    catch (err) {
        // Delete user if email fails
        yield user_schema_1.default.deleteOne({ _id: user._id });
        throw new errors_1.AppError("Failed to send OTP email", 500, "EMAIL_SEND_FAILED");
    }
    return user;
});
exports.signUpUser = signUpUser;
const signIn = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = input;
    console.log("HIT");
    // Find user by email (lowercase), include password for validation
    const user = yield user_schema_1.default.findOne({
        email: email,
    }).select("+password");
    if (!user) {
        throw new errors_1.AppError("Invalid email or password", 401, "AUTH_FAILED");
    }
    // Check if user is blocked
    if (user.isBlocked) {
        throw new errors_1.AppError("User account is blocked", 403, "USER_BLOCKED");
    }
    // Check if user is verified
    if (config_1.default.nodeEnv !== "development" && !user.isVerified) {
        throw new errors_1.AppError("User account is not verified", 403, "USER_NOT_VERIFIED");
    }
    // Validate password
    const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new errors_1.AppError("Invalid email or password", 401, "AUTH_FAILED");
    }
    // Remove password field before returning user
    const userObj = user.toObject();
    delete userObj.password;
    // Generate JWT token
    const accessToken = (0, builder_1.generateAccessToken)(String(user._id), user.role);
    return { user: userObj, accessToken };
});
exports.signIn = signIn;
// Verify OTP for signup
const verifyOtp = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({ email: email }).select("+otp +otpExpires");
    if (!user) {
        throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
    }
    if (user.isVerified) {
        throw new errors_1.AppError("User is already verified", 400, "ALREADY_VERIFIED");
    }
    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
        throw new errors_1.AppError("OTP is invalid or expired", 400, "INVALID_OTP");
    }
    if (user.otp !== otp) {
        throw new errors_1.AppError("Invalid OTP", 400, "INVALID_OTP");
    }
    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.role = user_interface_1.UserRole.Manager;
    yield user.save();
    return user;
});
exports.verifyOtp = verifyOtp;
// Forgot password: Generate and send OTP
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({ email: email.toLowerCase() }).select("+otp +otpExpires +resetToken +resetTokenExpires");
    if (!user) {
        throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
    }
    // Generate OTP and reset token
    const otp = generateOtp();
    const resetToken = generateResetToken();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    // Update user
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.resetToken = resetToken;
    user.resetTokenExpires = otpExpires;
    yield user.save();
    // Send OTP email
    try {
        yield (0, sendEmail_1.sendOtpEmail)(user.email, otp, user.name, "10 minutes");
    }
    catch (err) {
        // Clear OTP and reset token if email fails
        user.otp = undefined;
        user.otpExpires = undefined;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        yield user.save();
        throw new errors_1.AppError("Failed to send OTP email", 500, "EMAIL_SEND_FAILED");
    }
});
exports.forgotPassword = forgotPassword;
// Reset password with OTP and reset token
const resetPassword = (email, otp, resetToken, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({ email: email.toLowerCase() }).select("+otp +otpExpires +resetToken +resetTokenExpires +password");
    if (!user) {
        throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
    }
    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
        throw new errors_1.AppError("OTP is invalid or expired", 400, "INVALID_OTP");
    }
    if (user.otp !== otp || user.resetToken !== resetToken) {
        throw new errors_1.AppError("Invalid OTP or reset token", 400, "INVALID_CREDENTIALS");
    }
    // Update password and clear OTP/reset token
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    yield user.save();
});
exports.resetPassword = resetPassword;
// Create a new user (non-OTP version, for admin use)
const createUser = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, role = user_interface_1.UserRole.Viewer, messId } = input, rest = __rest(input, ["email", "password", "role", "messId"]);
    const existingUser = yield user_schema_1.default.findOne({ email });
    if (existingUser) {
        throw new errors_1.AppError("Email already exists", 400, "EMAIL_EXISTS");
    }
    const userData = Object.assign(Object.assign({}, rest), { email: email.toLowerCase(), password,
        role, balance: 0, isVerified: false, isBlocked: false, isApproved: false });
    const user = yield user_schema_1.default.create(userData);
    return user;
});
exports.createUser = createUser;
// Get user by ID
const getUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_ID");
    }
    const user = yield user_schema_1.default.findById(userId).select("-password -otp -resetToken -refreshToken");
    if (!user) {
        throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return user;
});
exports.getUserById = getUserById;
// Get user by email
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({ email: email.toLowerCase() }).select("-password -otp -resetToken -refreshToken");
    if (!user) {
        throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return user;
});
exports.getUserByEmail = getUserByEmail;
// Get all users with optional filters
const getUsers = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const query = {};
    if (filters.messId) {
        query.messId = new mongoose_1.Types.ObjectId(filters.messId);
    }
    if (filters.role) {
        query.role = filters.role;
    }
    if (typeof filters.isVerified === "boolean") {
        query.isVerified = filters.isVerified;
    }
    if (typeof filters.isBlocked === "boolean") {
        query.isBlocked = filters.isBlocked;
    }
    if (typeof filters.isApproved === "boolean") {
        query.isApproved = filters.isApproved;
    }
    return user_schema_1.default.find(query)
        .select("-password -otp -resetToken -refreshToken")
        .limit(filters.limit || 100)
        .skip(filters.skip || 0)
        .sort({ createdAt: -1 });
});
exports.getUsers = getUsers;
// Update user details
const updateUser = (userId, input, updatedBy) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_ID");
    }
    const user = yield user_schema_1.default.findById(userId);
    if (!user) {
        throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
    }
    const updateData = {};
    const activityLog = {
        action: "approved", // Default to a valid action, will be overwritten below if needed
        performedBy: {
            name: updatedBy.name,
            managerId: new mongoose_1.Types.ObjectId(updatedBy.managerId),
        },
        timestamp: new Date(),
    };
    if (input.name)
        updateData.name = input.name;
    if (input.gender)
        updateData.gender = input.gender;
    if (input.dateOfBirth)
        updateData.dateOfBirth = input.dateOfBirth;
    if (input.phone)
        updateData.phone = input.phone;
    if (input.address)
        updateData.address = input.address;
    if (input.profilePicture)
        updateData.profilePicture = input.profilePicture;
    if (input.nid)
        updateData.nid = input.nid;
    if (input.role) {
        updateData.role = input.role;
        // No action assignment here since "promoted"/"demoted" are not allowed values
    }
    if (input.messId)
        updateData.messId = new mongoose_1.Types.ObjectId(input.messId);
    if (typeof input.balance === "number")
        updateData.balance = input.balance;
    if (typeof input.isVerified === "boolean") {
        updateData.isVerified = input.isVerified;
        activityLog.action = input.isVerified ? "approved" : "rejected";
    }
    if (typeof input.isBlocked === "boolean") {
        updateData.isBlocked = input.isBlocked;
        activityLog.action = input.isBlocked ? "blocked" : "unblocked";
    }
    if (typeof input.isApproved === "boolean") {
        updateData.isApproved = input.isApproved;
        activityLog.action = input.isApproved ? "approved" : "rejected";
    }
    user.set(Object.assign({}, updateData));
    yield user.save();
    return user;
});
exports.updateUser = updateUser;
// Update user password
const updatePassword = (userId, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_ID");
    }
    const user = yield user_schema_1.default.findById(userId);
    if (!user) {
        throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
    }
    user.password = newPassword;
    yield user.save();
});
exports.updatePassword = updatePassword;
const softDeleteUser = (userId, deletedBy) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new errors_1.AppError("Invalid user ID", 400, "INVALID_ID");
        }
        const user = yield user_schema_1.default.findById(userId).session(session);
        if (!user) {
            throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
        }
        const activity = new activity_schema_1.default({
            action: "blocked",
            performedBy: {
                name: deletedBy.name,
                managerId: new mongoose_1.Types.ObjectId(deletedBy.managerId),
            },
            timestamp: new Date(),
            entity: "User",
            entityId: user._id,
        });
        yield activity.save({ session });
        user.isBlocked = true;
        user.isDeleted = true;
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
exports.softDeleteUser = softDeleteUser;
// Add activity log
const addActivityLog = (userId, log) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new errors_1.AppError("Invalid user ID", 400, "INVALID_ID");
    }
    const user = yield user_schema_1.default.findById(userId);
    if (!user) {
        throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
    }
    // user.activityLogs.push({
    //   action: log.action,
    //   performedBy: {
    //     name: log.performedBy.name,
    //     managerId: new Types.ObjectId(log.performedBy.managerId),
    //   },
    //   timestamp: new Date(),
    // });
    yield user.save();
});
exports.addActivityLog = addActivityLog;
// Interface for approving mess join input
