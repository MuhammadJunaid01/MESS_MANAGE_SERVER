import express from "express";
import rateLimit from "express-rate-limit";
import { protect, restrictTo } from "../../middlewares/auth";
import { validate } from "../../middlewares/validation";
import {
  createMessSchema,
  deleteMessSchema,
  getMessByIdSchema,
  getMessesSchema,
  updateMessSchema,
} from "../../schemas/mess.schema";
import { UserRole } from "../User/user.interface";
import {
  createMessController,
  deleteMessController,
  getMessByIdController,
  getMessesController,
  updateMessController,
} from "./mess.controller";

const router = express.Router();

// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});

// Protected routes (require authentication)
router.use(protect);

// Mess routes
router.post(
  "/",
  validate(createMessSchema),
  restrictTo(UserRole.Admin, UserRole.Manager),
  createMessController
);
router.get(
  "/:messId",
  getLimiter,
  validate(getMessByIdSchema),
  getMessByIdController
);
router.get("/", getLimiter, validate(getMessesSchema), getMessesController);
router.patch(
  "/:messId",
  validate(updateMessSchema),
  restrictTo(UserRole.Admin, UserRole.Manager),
  updateMessController
);
router.delete(
  "/:messId",
  validate(deleteMessSchema),
  restrictTo(UserRole.Admin),
  deleteMessController
);

export { router as messRouter };
