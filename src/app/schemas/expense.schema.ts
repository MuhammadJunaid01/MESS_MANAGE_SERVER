import { z } from "zod";
import { IStatus } from "../interfaces/global.interface";
import {
  ExpenseCategory,
  GroceryCategory,
  GroceryUnit,
} from "../modules/Expense/expense.interface";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const groceryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.enum(Object.values(GroceryUnit) as [string, ...string[]], {
    message: "Invalid unit",
  }),
  price: z.number().nonnegative("Price cannot be negative"),
  category: z.enum(Object.values(GroceryCategory) as [string, ...string[]], {
    message: "Invalid category",
  }),
});

export const createExpenseSchema = z.object({
  body: z.object({
    messId: z.string().regex(objectIdRegex, "Invalid mess ID"),
    category: z.enum(Object.values(ExpenseCategory) as [string, ...string[]], {
      message: "Invalid category",
    }),
    amount: z.number().nonnegative("Amount cannot be negative"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description too long"),
    date: z.string().datetime({ message: "Invalid date format" }),
    items: z.array(groceryItemSchema).optional(),
  }),
});

export const getExpenseByIdSchema = z.object({
  params: z.object({
    expenseId: z.string().regex(objectIdRegex, "Invalid expense ID"),
  }),
});

export const getExpensesSchema = z.object({
  query: z.object({
    messId: z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
    status: z.enum(Object.values(IStatus) as [string, ...string[]]).optional(),
    category: z
      .enum(Object.values(ExpenseCategory) as [string, ...string[]])
      .optional(),
    dateFrom: z
      .string()
      .datetime({ message: "Invalid dateFrom format" })
      .optional(),
    dateTo: z
      .string()
      .datetime({ message: "Invalid dateTo format" })
      .optional(),
    createdBy: z.string().regex(objectIdRegex, "Invalid user ID").optional(),
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

export const updateExpenseSchema = z.object({
  params: z.object({
    expenseId: z.string().regex(objectIdRegex, "Invalid expense ID"),
  }),
  body: z.object({
    category: z
      .enum(Object.values(ExpenseCategory) as [string, ...string[]])
      .optional(),
    amount: z.number().nonnegative("Amount cannot be negative").optional(),
    description: z.string().min(1).max(500, "Description too long").optional(),
    date: z.string().datetime({ message: "Invalid date format" }).optional(),
    items: z.array(groceryItemSchema).optional(),
  }),
});

export const updateExpenseStatusSchema = z.object({
  params: z.object({
    expenseId: z.string().regex(objectIdRegex, "Invalid expense ID"),
  }),
  body: z.object({
    status: z.enum([IStatus.Approved, IStatus.Rejected], {
      message: "Status must be Approved or Rejected",
    }),
  }),
});

export const deleteExpenseSchema = z.object({
  params: z.object({
    expenseId: z.string().regex(objectIdRegex, "Invalid expense ID"),
  }),
});
