import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect, restrictTo } from "../../middlewares/auth";
import { sanitizeInput } from "../../middlewares/sanitize.middleware";
import { validate } from "../../middlewares/validation";
import {
  createMealSchema,
  deleteMealSchema,
  getMealByIdSchema,
  getMealsSchema,
  toggleMealsForDateRangeSchema,
  updateMealSchema,
} from "../../schemas/meal.schema";
import { getMealReportSchema } from "../../schemas/report.schema";
import {
  createMealController,
  deleteMealController,
  getMealByIdController,
  getMealsController,
  toggleMealsForDateRangeController,
  updateMealController,
} from "../Meal/meal.controller";
import { UserRole } from "../User/user.interface";
import { generateMealReportController } from "./meal.controller";

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
router.post(
  "/",
  sanitizeInput,
  validate(createMealSchema),
  createMealController
);
router.get(
  "/:mealId",
  getLimiter,
  sanitizeInput,
  validate(getMealByIdSchema),
  getMealByIdController
);
router.get(
  "/",
  getLimiter,
  sanitizeInput,
  validate(getMealsSchema),
  getMealsController
);
router.patch(
  "/:mealId",
  sanitizeInput,
  validate(updateMealSchema),
  updateMealController
);
router.delete(
  "/:mealId",
  sanitizeInput,
  validate(deleteMealSchema),
  restrictTo(UserRole.Admin, UserRole.Manager),
  deleteMealController
);
router.post(
  "/toggle",
  sanitizeInput,
  validate(toggleMealsForDateRangeSchema),
  toggleMealsForDateRangeController
);
router.get(
  "/report",
  getLimiter,
  sanitizeInput,
  validate(getMealReportSchema),
  generateMealReportController
);

export { router as mealRouter };
