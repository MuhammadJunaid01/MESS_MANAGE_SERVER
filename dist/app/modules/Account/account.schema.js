"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const account_interface_1 = require("./account.interface");
const ActivityLogSchema = new mongoose_1.Schema({
    action: {
        type: String,
        enum: Object.values(account_interface_1.IActivityAction),
        required: true,
    },
    performedBy: {
        userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
    },
    timestamp: { type: Date, default: Date.now },
});
const AccountSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    messId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Mess", required: true },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Balance cannot be negative"],
    },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    activityLogs: { type: [ActivityLogSchema], select: false },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});
// Indexes
AccountSchema.index({ userId: 1, messId: 1 }, { unique: true });
AccountSchema.index({ messId: 1 });
AccountSchema.index({ isDeleted: 1 });
const AccountModel = (0, mongoose_1.model)("Account", AccountSchema);
exports.default = AccountModel;
