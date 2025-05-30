"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addActivityLogSchema = exports.softDeleteUserSchema = exports.updatePasswordSchema = exports.updateUserSchema = exports.getUsersSchema = exports.getUserByEmailSchema = exports.getUserByIdSchema = exports.createUserSchema = exports.approveMessJoinSchema = exports.joinMessSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.verifyOtpSchema = exports.signUpSchema = void 0;
const zod_1 = require("zod");
const user_interface_1 = require("../modules/User/user.interface");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
exports.signUpSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required"),
        email: zod_1.z.string().email("Invalid email format"),
        gender: zod_1.z.enum(Object.values(user_interface_1.Gender), {
            errorMap: () => ({ message: "Invalid gender" }),
        }),
        dateOfBirth: zod_1.z.string().datetime().optional(),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        phone: zod_1.z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
        address: zod_1.z.string().optional(),
        profilePicture: zod_1.z.string().url().optional(),
        nid: zod_1.z
            .string()
            .regex(/^\d{10,17}$/, "Invalid NID format")
            .optional(),
        role: zod_1.z.enum(Object.values(user_interface_1.UserRole)).optional(),
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
    }),
});
exports.verifyOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
        otp: zod_1.z
            .string()
            .length(6, "OTP must be 6 digits")
            .regex(/^\d{6}$/, "OTP must be numeric"),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
        otp: zod_1.z
            .string()
            .length(6, "OTP must be 6 digits")
            .regex(/^\d{6}$/, "OTP must be numeric"),
        resetToken: zod_1.z.string().min(1, "Reset token is required"),
        newPassword: zod_1.z
            .string()
            .min(8, "New password must be at least 8 characters"),
    }),
});
exports.joinMessSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID"),
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID"),
    }),
});
exports.approveMessJoinSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID"),
    }),
});
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required"),
        email: zod_1.z.string().email("Invalid email format"),
        gender: zod_1.z.enum(Object.values(user_interface_1.Gender), {
            errorMap: () => ({ message: "Invalid gender" }),
        }),
        dateOfBirth: zod_1.z.string().datetime().optional(),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        phone: zod_1.z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
        address: zod_1.z.string().optional(),
        profilePicture: zod_1.z.string().url().optional(),
        nid: zod_1.z
            .string()
            .regex(/^\d{10,17}$/, "Invalid NID format")
            .optional(),
        role: zod_1.z.enum(Object.values(user_interface_1.UserRole)).optional(),
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
    }),
});
exports.getUserByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID"),
    }),
});
exports.getUserByEmailSchema = zod_1.z.object({
    query: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email format"),
    }),
});
exports.getUsersSchema = zod_1.z.object({
    query: zod_1.z.object({
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
        role: zod_1.z.enum(Object.values(user_interface_1.UserRole)).optional(),
        isVerified: zod_1.z.enum(["true", "false"]).optional(),
        isBlocked: zod_1.z.enum(["true", "false"]).optional(),
        isApproved: zod_1.z.enum(["true", "false"]).optional(),
        limit: zod_1.z.string().regex(/^\d+$/, "Limit must be a number").optional(),
        skip: zod_1.z.string().regex(/^\d+$/, "Skip must be a number").optional(),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID"),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        gender: zod_1.z.enum(Object.values(user_interface_1.Gender)).optional(),
        dateOfBirth: zod_1.z.string().datetime().optional(),
        phone: zod_1.z
            .string()
            .regex(/^\+?[1-9]\d{1,14}$/)
            .optional(),
        address: zod_1.z.string().optional(),
        profilePicture: zod_1.z.string().url().optional(),
        nid: zod_1.z
            .string()
            .regex(/^\d{10,17}$/)
            .optional(),
        role: zod_1.z.enum(Object.values(user_interface_1.UserRole)).optional(),
        messId: zod_1.z.string().regex(objectIdRegex).optional(),
        balance: zod_1.z.number().min(0).optional(),
        isVerified: zod_1.z.boolean().optional(),
        isBlocked: zod_1.z.boolean().optional(),
        isApproved: zod_1.z.boolean().optional(),
    }),
});
exports.updatePasswordSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID"),
    }),
    body: zod_1.z.object({
        newPassword: zod_1.z
            .string()
            .min(8, "New password must be at least 8 characters"),
    }),
});
exports.softDeleteUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID"),
    }),
});
exports.addActivityLogSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID"),
    }),
    body: zod_1.z.object({
        action: zod_1.z.enum([
            "approved",
            "rejected",
            "blocked",
            "unblocked",
            "joined_mess",
        ]),
        performedBy: zod_1.z.object({
            name: zod_1.z.string().min(1, "Performer name is required"),
            managerId: zod_1.z.string().regex(objectIdRegex, "Invalid manager ID"),
        }),
    }),
});
