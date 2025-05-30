"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const expense_interface_1 = require("./expense.interface");
const GroceryItemSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    quantity: {
        type: Number,
        required: true,
        min: [0.001, "Quantity must be positive"],
    },
    unit: { type: String, enum: Object.values(expense_interface_1.GroceryUnit), required: true },
    price: { type: Number, required: true, min: [0, "Price cannot be negative"] },
    category: {
        type: String,
        enum: Object.values(expense_interface_1.GroceryCategory),
        required: true,
    },
});
const ActivityLogSchema = new mongoose_1.Schema({
    action: {
        type: String,
        enum: ["created", "updated", "approved", "rejected", "deleted"],
        required: true,
    },
    performedBy: {
        userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
    },
    timestamp: { type: Date, default: Date.now },
});
const ExpenseSchema = new mongoose_1.Schema({
    messId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Mess", required: true },
    category: {
        type: String,
        enum: Object.values(expense_interface_1.ExpenseCategory),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(expense_interface_1.ExpenseStatus),
        default: expense_interface_1.ExpenseStatus.Pending,
    },
    amount: {
        type: Number,
        required: true,
        min: [0, "Amount cannot be negative"],
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, "Description too long"],
    },
    date: { type: Date, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    items: { type: [GroceryItemSchema], default: undefined },
    activityLogs: { type: [ActivityLogSchema], select: false },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});
// Indexes
ExpenseSchema.index({ messId: 1 });
ExpenseSchema.index({ status: 1 });
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ createdBy: 1 });
ExpenseSchema.index({ messId: 1, status: 1, isDeleted: 1 });
const ExpenseModel = (0, mongoose_1.model)("Expense", ExpenseSchema);
exports.default = ExpenseModel;
