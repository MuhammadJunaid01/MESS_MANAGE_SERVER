"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const account_interface_1 = require("./account.interface");
const transactionSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: Object.values(account_interface_1.TransactionType),
        required: true,
    },
    description: { type: String, required: true },
}, { timestamps: true, _id: false });
// Account schema
const accountSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Member" },
    messId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Mess" },
    balance: { type: Number, required: true, default: 0 },
    transactions: { type: [transactionSchema], default: [] },
    date: { type: Date, required: true, default: Date.now },
}, { timestamps: true });
// Account model
const AccountModel = (0, mongoose_1.model)("Account", accountSchema);
exports.default = AccountModel;
