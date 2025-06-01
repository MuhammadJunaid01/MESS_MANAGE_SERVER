import express from "express";
import rateLimit from "express-rate-limit";
import { restrictTo } from "../../middlewares";
import { protect } from "../../middlewares/auth";
import { sanitizeInput } from "../../middlewares/sanitize.middleware";
import { validate } from "../../middlewares/validation";
import {
  createAccountSchema,
  createTransactionSchema,
  deleteAccountSchema,
  getAccountByIdSchema,
  getAccountsSchema,
  getTransactionsSchema,
} from "../../schemas/account.schema";
import { UserRole } from "../User/user.interface";
import {
  createAccountController,
  createTransactionController,
  deleteAccountController,
  getAccountByIdController,
  getAccountsController,
  getTransactionsController,
} from "./account.controller";

const router = express.Router();

// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});

// Protected routes (require authentication)
router.use(protect);

// Account routes
router.post(
  "/",
  sanitizeInput,
  validate(createAccountSchema),
  restrictTo(UserRole.Admin, UserRole.Manager),
  createAccountController
);
router.get(
  "/:accountId",
  getLimiter,
  sanitizeInput,
  validate(getAccountByIdSchema),
  getAccountByIdController
);
router.get(
  "/",
  getLimiter,
  sanitizeInput,
  validate(getAccountsSchema),
  getAccountsController
);
router.delete(
  "/:accountId",
  sanitizeInput,
  validate(deleteAccountSchema),
  restrictTo(UserRole.Admin),
  deleteAccountController
);

// Transaction routes (nested under account)
router.post(
  "/:accountId/transactions",
  sanitizeInput,
  validate(createTransactionSchema),
  restrictTo(UserRole.Admin, UserRole.Manager),
  createTransactionController
);
router.get(
  "/:accountId/transactions",
  getLimiter,
  sanitizeInput,
  validate(getTransactionsSchema),
  getTransactionsController
);

export { router as accountRouter };
