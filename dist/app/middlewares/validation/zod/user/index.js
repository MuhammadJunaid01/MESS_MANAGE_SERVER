"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.TransactionSchema = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
// Enum schemas
const UserRoleSchema = zod_1.z.enum([
    "Admin",
    "Member",
    "Buyer",
    "UtilityManager",
    "MealManager",
    "Viewer",
]);
const TransactionTypeSchema = zod_1.z.enum(["credit", "debit"]);
// Transaction schema
const TransactionSchema = zod_1.z.object({
    date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    amount: zod_1.z.number().positive("Amount must be positive"),
    type: TransactionTypeSchema,
    description: zod_1.z.string().min(1, "Description is required"),
});
exports.TransactionSchema = TransactionSchema;
// User schema
const UserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    address: zod_1.z.string().max(200, "Address is too long").optional(),
    profilePicture: zod_1.z.string().url("Invalid URL format").optional(),
    nid: zod_1.z
        .string()
        .regex(/^\d{10,17}$/, "Invalid NID format")
        .optional(),
    role: UserRoleSchema,
    messId: zod_1.z
        .string()
        .refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
        message: "Invalid ObjectId format for messId",
    })
        .optional(),
    balance: zod_1.z.number().min(0, "Balance cannot be negative").optional(),
    isVerified: zod_1.z.boolean(),
    isBlocked: zod_1.z.boolean(),
    isApproved: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    payToMess: zod_1.z.number().min(0, "Pay to mess cannot be negative"),
    receiveFromMess: zod_1.z.number().min(0, "Receive from mess cannot be negative"),
    transactionHistory: zod_1.z.array(TransactionSchema).optional(),
});
exports.UserSchema = UserSchema;
const signUpSchema = zod_1.z.object({
    body: UserSchema,
});
exports.default = signUpSchema;
