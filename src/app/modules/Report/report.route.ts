import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../../middlewares/auth";
import { sanitizeInput } from "../../middlewares/sanitize.middleware";
import { validate } from "../../middlewares/validation";
import {
  getMealReportSchema,
  groceryReportQuerySchema,
} from "../../schemas/report.schema";
import {
  generateGroceryReportController,
  generateMealReportController,
  generateUsersMealReportController,
} from "./report.controller";

const router = Router();

// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});

// Protected routes (require authentication)
router.use(protect);

// Meal routes

router.get(
  "/",
  getLimiter,
  sanitizeInput,
  validate(getMealReportSchema),
  generateMealReportController
);
router.get(
  "/users-meal-report",
  getLimiter,
  sanitizeInput,
  validate(getMealReportSchema),
  generateUsersMealReportController
);
router.get(
  "/grocery-report",
  getLimiter,
  sanitizeInput,
  validate(groceryReportQuerySchema),
  generateGroceryReportController
);
export { router as reportRouter };
