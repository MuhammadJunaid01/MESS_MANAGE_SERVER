"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const interfaces_1 = require("../../interfaces");
const expense_interface_1 = require("./expense.interface");
const TimelineSchema = new mongoose_1.Schema({
    createdBy: {
        userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        timestamp: { type: Date, required: true },
    },
    approvedBy: {
        userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
        name: String,
        timestamp: Date,
    },
    rejectedBy: {
        userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
        name: String,
        timestamp: Date,
    },
    updatedBy: [
        {
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
            name: String,
            timestamp: Date,
        },
    ],
}, { _id: false });
const GroceryItemSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: {
        type: String,
        enum: Object.values(expense_interface_1.GroceryUnit),
        required: true,
    },
    price: Number,
    category: {
        type: String,
        required: true,
        enum: Object.values(expense_interface_1.GroceryCategory),
    },
}, { _id: false });
const ExpenseSchema = new mongoose_1.Schema({
    messId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Mess", required: true },
    category: {
        type: String,
        enum: Object.values(expense_interface_1.ExpenseCategory),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(interfaces_1.IStatus),
        default: interfaces_1.IStatus.Pending,
    },
    amount: { type: Number, required: true },
    description: String,
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    timeline: {
        type: TimelineSchema, // Adjust if you have a schema for timeline
    },
    items: {
        type: [GroceryItemSchema],
        required: function () {
            // 'this' is the document being validated
            return this.category === expense_interface_1.ExpenseCategory.Grocery;
        },
    },
});
const ExpenseModel = mongoose_1.default.model("Expense", ExpenseSchema);
exports.default = ExpenseModel;
