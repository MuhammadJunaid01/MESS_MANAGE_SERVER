import express from "express";
import rateLimit from "express-rate-limit";
import { restrictTo } from "../../middlewares";
import { protect } from "../../middlewares/auth";
import { sanitizeInput } from "../../middlewares/sanitize.middleware";
import { validate } from "../../middlewares/validation";
import {
  createSettingSchema,
  getSettingSchema,
  updateSettingSchema,
} from "../../schemas/MSetting.schema";
import { UserRole } from "../User/user.interface";
import {
  createSettingController,
  getSettingController,
  updateSettingController,
} from "./MSetting.controller";

const router = express.Router();

// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});

// Protected routes (require authentication)
router.use(protect);

// Setting routes
router.post(
  "/",
  sanitizeInput,
  validate(createSettingSchema),
  restrictTo(UserRole.Admin, UserRole.Manager),
  createSettingController
);
router.get(
  "/:messId",
  getLimiter,
  sanitizeInput,
  validate(getSettingSchema),
  getSettingController
);
router.patch(
  "/:messId",
  sanitizeInput,
  validate(updateSettingSchema),
  restrictTo(UserRole.Admin),
  updateSettingController
);

export { router as mSettingRouter };
