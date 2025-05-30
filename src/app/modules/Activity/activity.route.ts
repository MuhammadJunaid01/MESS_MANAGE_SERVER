import { Router } from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../../middlewares/auth";
import { sanitizeInput } from "../../middlewares/sanitize.middleware";
import { validate } from "../../middlewares/validation";
import { getRecentActivitiesSchema } from "../../schemas/activity.schema";
import { getRecentActivitiesController } from "./activity.controller";

const router = Router();

// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});

// Protected routes (require authentication)
router.use(protect);

// Recent activities route
router.get(
  "/",
  getLimiter,
  sanitizeInput,
  validate(getRecentActivitiesSchema),
  getRecentActivitiesController
);

export { router as activityRouter };
