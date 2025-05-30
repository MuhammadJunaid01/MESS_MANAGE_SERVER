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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const ActivityLogSchema = new mongoose_1.Schema({
    action: {
        type: String,
        enum: ["approved", "rejected", "blocked", "unblocked"],
        required: true,
    },
    performedBy: {
        name: { type: String, required: true },
        managerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    },
    timestamp: { type: Date, default: Date.now },
});
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    gender: {
        type: String,
        enum: Object.values(user_interface_1.Gender),
        required: true,
    },
    dateOfBirth: { type: Date },
    password: { type: String, required: true, select: false },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: (v) => /^\+?[1-9]\d{1,14}$/.test(v),
            message: "Invalid phone number format",
        },
    },
    address: { type: String, trim: true },
    profilePicture: { type: String },
    nid: {
        type: String,
        validate: {
            validator: (v) => /^\d{10,17}$/.test(v),
            message: "Invalid NID format",
        },
    },
    role: {
        type: String,
        enum: Object.values(user_interface_1.UserRole),
        default: user_interface_1.UserRole.Viewer,
    },
    messId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Mess" },
    balance: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    resetToken: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    activityLogs: [ActivityLogSchema],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});
// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ messId: 1, role: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });
UserSchema.index({ resetTokenExpires: 1 }, { expireAfterSeconds: 0 });
// Password hashing middleware
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        const salt = yield bcryptjs_1.default.genSalt(10);
        this.password = yield bcryptjs_1.default.hash(this.password, salt);
        next();
    });
});
// Password comparison method
UserSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.compare(candidatePassword, this.password);
    });
};
const UserModel = (0, mongoose_1.model)("User", UserSchema);
exports.default = UserModel;
