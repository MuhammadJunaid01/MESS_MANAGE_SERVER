"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const interfaces_1 = require("../../interfaces");
const expense_interface_1 = require("./expense.interface");
const GroceryItemSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    quantity: {
        type: Number,
        required: true,
        min: [0.001, "Quantity must be positive"],
    },
    unit: { type: String, enum: Object.values(expense_interface_1.GroceryUnit), required: true },
    price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"],
    },
    category: {
        type: String,
        enum: Object.values(expense_interface_1.GroceryCategory),
        required: true,
    },
}, {
    _id: false,
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
        enum: Object.values(interfaces_1.IStatus),
        default: interfaces_1.IStatus.Pending,
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
    deletedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, default: new Date() },
    items: {
        type: [GroceryItemSchema],
        default: undefined,
        required: function () {
            return (this === null || this === void 0 ? void 0 : this.category) === expense_interface_1.ExpenseCategory.Grocery;
        },
    },
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
