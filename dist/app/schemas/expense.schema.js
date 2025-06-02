"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpenseSchema = exports.updateExpenseStatusSchema = exports.updateExpenseSchema = exports.getExpensesSchema = exports.getExpenseByIdSchema = exports.createExpenseSchema = void 0;
const zod_1 = require("zod");
const global_interface_1 = require("../interfaces/global.interface");
const expense_interface_1 = require("../modules/Expense/expense.interface");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const groceryItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(100, "Name too long"),
    quantity: zod_1.z.number().positive("Quantity must be positive"),
    unit: zod_1.z.enum(Object.values(expense_interface_1.GroceryUnit), {
        message: "Invalid unit",
    }),
    price: zod_1.z.number().nonnegative("Price cannot be negative"),
    category: zod_1.z.enum(Object.values(expense_interface_1.GroceryCategory), {
        message: "Invalid category",
    }),
});
exports.createExpenseSchema = zod_1.z.object({
    body: zod_1.z.object({
        category: zod_1.z.enum(Object.values(expense_interface_1.ExpenseCategory), {
            message: "Invalid category",
        }),
        amount: zod_1.z.number().nonnegative("Amount cannot be negative"),
        description: zod_1.z
            .string()
            .min(1, "Description is required")
            .max(500, "Description too long"),
        date: zod_1.z.string().datetime({ message: "Invalid date format" }),
        items: zod_1.z.array(groceryItemSchema).optional(),
    }),
});
exports.getExpenseByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        expenseId: zod_1.z.string().regex(objectIdRegex, "Invalid expense ID"),
    }),
});
exports.getExpensesSchema = zod_1.z.object({
    query: zod_1.z.object({
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
        status: zod_1.z.enum(Object.values(global_interface_1.IStatus)).optional(),
        category: zod_1.z
            .enum(Object.values(expense_interface_1.ExpenseCategory))
            .optional(),
        dateFrom: zod_1.z
            .string()
            .datetime({ message: "Invalid dateFrom format" })
            .optional(),
        dateTo: zod_1.z
            .string()
            .datetime({ message: "Invalid dateTo format" })
            .optional(),
        createdBy: zod_1.z.string().regex(objectIdRegex, "Invalid user ID").optional(),
        limit: zod_1.z.coerce
            .number()
            .int()
            .positive("Limit must be a positive integer")
            .optional(),
        skip: zod_1.z.coerce
            .number()
            .int()
            .nonnegative("Skip must be non-negative")
            .optional(),
    }),
});
exports.updateExpenseSchema = zod_1.z.object({
    params: zod_1.z.object({
        expenseId: zod_1.z.string().regex(objectIdRegex, "Invalid expense ID"),
    }),
    body: zod_1.z.object({
        category: zod_1.z
            .enum(Object.values(expense_interface_1.ExpenseCategory))
            .optional(),
        amount: zod_1.z.number().nonnegative("Amount cannot be negative").optional(),
        description: zod_1.z.string().min(1).max(500, "Description too long").optional(),
        date: zod_1.z.string().datetime({ message: "Invalid date format" }).optional(),
        items: zod_1.z.array(groceryItemSchema).optional(),
    }),
});
exports.updateExpenseStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        expenseId: zod_1.z.string().regex(objectIdRegex, "Invalid expense ID"),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum([global_interface_1.IStatus.Approved, global_interface_1.IStatus.Rejected], {
            message: "Status must be Approved or Rejected",
        }),
    }),
});
exports.deleteExpenseSchema = zod_1.z.object({
    params: zod_1.z.object({
        expenseId: zod_1.z.string().regex(objectIdRegex, "Invalid expense ID"),
    }),
});
