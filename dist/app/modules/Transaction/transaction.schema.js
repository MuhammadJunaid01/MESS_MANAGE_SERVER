"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const account_interface_1 = require("../Account/account.interface");
const TransactionSchema = new mongoose_1.Schema({
    accountId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Account", required: true },
    amount: {
        type: Number,
        required: true,
        min: [0.01, "Amount must be positive"],
    },
    type: {
        type: String,
        enum: Object.values(account_interface_1.TransactionType),
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, "Description too long"],
    },
    date: { type: Date, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    activityLogs: { type: mongoose_1.Schema.Types.Mixed, default: [] }, // Reuse ActivityLogSchema
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});
// Indexes
TransactionSchema.index({ accountId: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1 });
const TransactionModel = (0, mongoose_1.model)("Transaction", TransactionSchema);
exports.default = TransactionModel;
