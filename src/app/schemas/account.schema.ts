import { z } from "zod";
import { TransactionType } from "../modules/Account/account.interface";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createAccountSchema = z.object({
  body: z.object({
    userId: z.string().regex(objectIdRegex, "Invalid user ID"),
    messId: z.string().regex(objectIdRegex, "Invalid mess ID"),
  }),
});

export const getAccountByIdSchema = z.object({
  params: z.object({
    accountId: z.string().regex(objectIdRegex, "Invalid account ID"),
  }),
});

export const getAccountsSchema = z.object({
  query: z.object({
    messId: z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
    userId: z.string().regex(objectIdRegex, "Invalid user ID").optional(),
    limit: z.coerce
      .number()
      .int()
      .positive("Limit must be a positive integer")
      .optional(),
    skip: z.coerce
      .number()
      .int()
      .nonnegative("Skip must be non-negative")
      .optional(),
  }),
});

export const createTransactionSchema = z.object({
  params: z.object({
    accountId: z.string().regex(objectIdRegex, "Invalid account ID"),
  }),
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    type: z.enum([TransactionType.Credit, TransactionType.Debit], {
      message: "Invalid transaction type",
    }),
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description too long"),
    date: z.string().datetime({ message: "Invalid date format" }),
  }),
});

export const getTransactionsSchema = z.object({
  params: z.object({
    accountId: z.string().regex(objectIdRegex, "Invalid account ID"),
  }),
  query: z.object({
    type: z.enum([TransactionType.Credit, TransactionType.Debit]).optional(),
    dateFrom: z
      .string()
      .datetime({ message: "Invalid dateFrom format" })
      .optional(),
    dateTo: z
      .string()
      .datetime({ message: "Invalid dateTo format" })
      .optional(),
    limit: z.coerce
      .number()
      .int()
      .positive("Limit must be a positive integer")
      .optional(),
    skip: z.coerce
      .number()
      .int()
      .nonnegative("Skip must be non-negative")
      .optional(),
  }),
});

export const deleteAccountSchema = z.object({
  params: z.object({
    accountId: z.string().regex(objectIdRegex, "Invalid account ID"),
  }),
});
