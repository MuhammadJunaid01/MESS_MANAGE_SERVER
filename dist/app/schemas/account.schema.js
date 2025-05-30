"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccountSchema = exports.getTransactionsSchema = exports.createTransactionSchema = exports.getAccountsSchema = exports.getAccountByIdSchema = exports.createAccountSchema = void 0;
const zod_1 = require("zod");
const account_interface_1 = require("../modules/Account/account.interface");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
exports.createAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID"),
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID"),
    }),
});
exports.getAccountByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        accountId: zod_1.z.string().regex(objectIdRegex, "Invalid account ID"),
    }),
});
exports.getAccountsSchema = zod_1.z.object({
    query: zod_1.z.object({
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID").optional(),
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
exports.createTransactionSchema = zod_1.z.object({
    params: zod_1.z.object({
        accountId: zod_1.z.string().regex(objectIdRegex, "Invalid account ID"),
    }),
    body: zod_1.z.object({
        amount: zod_1.z.number().positive("Amount must be positive"),
        type: zod_1.z.enum([account_interface_1.TransactionType.Credit, account_interface_1.TransactionType.Debit], {
            message: "Invalid transaction type",
        }),
        description: zod_1.z
            .string()
            .min(1, "Description is required")
            .max(500, "Description too long"),
        date: zod_1.z.string().datetime({ message: "Invalid date format" }),
    }),
});
exports.getTransactionsSchema = zod_1.z.object({
    params: zod_1.z.object({
        accountId: zod_1.z.string().regex(objectIdRegex, "Invalid account ID"),
    }),
    query: zod_1.z.object({
        type: zod_1.z.enum([account_interface_1.TransactionType.Credit, account_interface_1.TransactionType.Debit]).optional(),
        dateFrom: zod_1.z
            .string()
            .datetime({ message: "Invalid dateFrom format" })
            .optional(),
        dateTo: zod_1.z
            .string()
            .datetime({ message: "Invalid dateTo format" })
            .optional(),
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
exports.deleteAccountSchema = zod_1.z.object({
    params: zod_1.z.object({
        accountId: zod_1.z.string().regex(objectIdRegex, "Invalid account ID"),
    }),
});
