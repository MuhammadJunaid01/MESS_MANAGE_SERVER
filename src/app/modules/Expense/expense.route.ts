import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect, restrictTo } from "../../middlewares/auth";
import { sanitizeInput } from "../../middlewares/sanitize.middleware";
import { validate } from "../../middlewares/validation";
import {
  createExpenseSchema,
  deleteExpenseSchema,
  getExpenseByIdSchema,
  getExpensesSchema,
  updateExpenseSchema,
  updateExpenseStatusSchema,
} from "../../schemas/expense.schema";
import { UserRole } from "../User/user.interface";
import {
  createExpenseController,
  deleteExpenseController,
  getExpenseByIdController,
  getExpensesController,
  updateExpenseController,
  updateExpenseStatusController,
} from "./expense.controller";

const router = Router();

// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});

// Protected routes (require authentication)
router.use(protect);

// Expense routes
router.post(
  "/",
  sanitizeInput,
  validate(createExpenseSchema),
  createExpenseController
);
router.get(
  "/:expenseId",
  getLimiter,
  sanitizeInput,
  validate(getExpenseByIdSchema),
  getExpenseByIdController
);
router.get(
  "/",
  getLimiter,
  sanitizeInput,
  validate(getExpensesSchema),
  getExpensesController
);
router.patch(
  "/:expenseId",
  sanitizeInput,
  validate(updateExpenseSchema),
  updateExpenseController
);
router.patch(
  "/:expenseId/status",
  sanitizeInput,
  validate(updateExpenseStatusSchema),
  restrictTo(UserRole.Admin, UserRole.Manager),
  updateExpenseStatusController
);
router.delete(
  "/:expenseId",
  sanitizeInput,
  validate(deleteExpenseSchema),
  restrictTo(UserRole.Admin, UserRole.Manager),
  deleteExpenseController
);

export { router as expenseRouter };
