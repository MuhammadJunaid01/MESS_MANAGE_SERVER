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
exports.addActivityLogController = exports.softDeleteUserController = exports.updatePasswordController = exports.updateUserController = exports.getUsersController = exports.getUserByEmailController = exports.getUserByIdController = exports.createUserController = exports.resetPasswordController = exports.forgotPasswordController = exports.verifyOtpController = exports.signInController = exports.signUpUserController = exports.approveMessJoinController = exports.joinMessController = void 0;
const user_service_1 = require("./user.service");
const utils_1 = require("../../lib/utils");
const middlewares_1 = require("../../middlewares");
const errors_1 = require("../../middlewares/errors");
// Join mess controller
exports.joinMessController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, messId } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    yield (0, user_service_1.joinMess)({
        userId,
        messId,
        performedBy: {
            name: authUser.name,
            managerId: authUser.userId,
        },
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User joined mess successfully, pending approval",
        data: null,
    });
}));
// Approve mess join controller
exports.approveMessJoinController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    yield (0, user_service_1.approveMessJoin)({
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
// Sign up controller
exports.signUpUserController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, gender, dateOfBirth, password, phone, address, profilePicture, nid, role, messId, } = req.body;
    const user = yield (0, user_service_1.signUpUser)({
        name,
        email,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        password,
        phone,
        address,
        profilePicture,
        nid,
        role,
        messId,
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "User signed up successfully, OTP sent to email",
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        },
    });
}));
exports.signInController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const response = yield (0, user_service_1.signIn)({ email, password });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User signed in successfully",
        data: { user: response.user, accessToken: response.accessToken },
    });
}));
// Verify OTP controller
exports.verifyOtpController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    const user = yield (0, user_service_1.verifyOtp)(email, otp);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "OTP verified successfully",
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
            },
        },
    });
}));
// Forgot password controller
exports.forgotPasswordController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    yield (0, user_service_1.forgotPassword)(email);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "OTP sent to email for password reset",
        data: null,
    });
}));
// Reset password controller
exports.resetPasswordController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp, resetToken, newPassword } = req.body;
    yield (0, user_service_1.resetPassword)(email, otp, resetToken, newPassword);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Password reset successfully",
        data: null,
    });
}));
// Create user controller (admin only)
exports.createUserController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, gender, dateOfBirth, password, phone, address, profilePicture, nid, role, messId, } = req.body;
    const user = yield (0, user_service_1.createUser)({
        name,
        email,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        password,
        phone,
        address,
        profilePicture,
        nid,
        role,
        messId,
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "User created successfully",
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        },
    });
}));
// Get user by ID controller
exports.getUserByIdController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const user = yield (0, user_service_1.getUserById)(userId);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User retrieved successfully",
        data: { user },
    });
}));
// Get user by email controller
exports.getUserByEmailController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    const user = yield (0, user_service_1.getUserByEmail)(email);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User retrieved successfully",
        data: { user },
    });
}));
// Get users controller
exports.getUsersController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { messId, role, isVerified, isBlocked, isApproved, limit, skip } = req.query;
    const filters = {
        messId: messId,
        role: role,
        isVerified: isVerified === "true"
            ? true
            : isVerified === "false"
                ? false
                : undefined,
        isBlocked: isBlocked === "true" ? true : isBlocked === "false" ? false : undefined,
        isApproved: isApproved === "true"
            ? true
            : isApproved === "false"
                ? false
                : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        skip: skip ? parseInt(skip, 10) : undefined,
    };
    const users = yield (0, user_service_1.getUsers)(filters);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Users retrieved successfully",
        data: { users },
    });
}));
// Update user controller
exports.updateUserController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { name, gender, dateOfBirth, phone, address, profilePicture, nid, role, messId, balance, isVerified, isBlocked, isApproved, } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    const user = yield (0, user_service_1.updateUser)(userId, {
        name,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        phone,
        address,
        profilePicture,
        nid,
        role,
        messId,
        balance: balance ? Number(balance) : undefined,
        isVerified,
        isBlocked,
        isApproved,
    }, {
        name: authUser.name,
        managerId: authUser.userId,
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User updated successfully",
        data: { user },
    });
}));
// Update password controller
exports.updatePasswordController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { newPassword } = req.body;
    yield (0, user_service_1.updatePassword)(userId, newPassword);
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Password updated successfully",
        data: null,
    });
}));
// Soft delete user controller
exports.softDeleteUserController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    yield (0, user_service_1.softDeleteUser)(userId, {
        name: authUser.name,
        managerId: authUser.userId,
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User soft deleted successfully",
        data: null,
    });
}));
// Add activity log controller
exports.addActivityLogController = (0, middlewares_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { action, performedBy } = req.body;
    const authUser = req.user;
    if (!authUser) {
        throw new errors_1.AppError("Unauthorized: No authenticated user", 401, "UNAUTHORIZED");
    }
    yield (0, user_service_1.addActivityLog)(userId, {
        action,
        performedBy: {
            name: performedBy.name,
            managerId: performedBy.managerId,
        },
    });
    (0, utils_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Activity log added successfully",
        data: null,
    });
}));
