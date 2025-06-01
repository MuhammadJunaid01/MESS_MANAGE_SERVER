import { Router } from "express";
import { restrictTo } from "../../middlewares";
import { protect } from "../../middlewares/auth";
import { validate } from "../../middlewares/validation";
import {
  addActivityLogSchema,
  approveMessJoinSchema,
  createUserSchema,
  forgotPasswordSchema,
  getUserByEmailSchema,
  getUserByIdSchema,
  getUsersSchema,
  joinMessSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  softDeleteUserSchema,
  updatePasswordSchema,
  updateUserSchema,
  verifyOtpSchema,
} from "../../schemas/user.schemas";
import {
  addActivityLogController,
  approveMessJoinController,
  createUserController,
  forgotPasswordController,
  getUserByEmailController,
  getUserByIdController,
  getUsersController,
  joinMessController,
  resetPasswordController,
  signInController,
  signUpUserController,
  softDeleteUserController,
  updatePasswordController,
  updateUserController,
  verifyOtpController,
} from "./user.controller";
import { UserRole } from "./user.interface";

const router = Router();

// Public routes
router.post("/signup", validate(signUpSchema), signUpUserController);
router.post("/signin", validate(signInSchema), signInController);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpController);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController
);

// Protected routes (require authentication)
router.use(protect);

// User routes
router.post("/join-mess", validate(joinMessSchema), joinMessController);
router.post(
  "/users/:userId/approve-mess",
  validate(approveMessJoinSchema),
  restrictTo(UserRole.Admin, UserRole.Manager),
  approveMessJoinController
);
router.get(
  "/users/:userId",
  validate(getUserByIdSchema),
  getUserByIdController
);
router.get(
  "/users/email",
  validate(getUserByEmailSchema),
  getUserByEmailController
);
router.get("/users", validate(getUsersSchema), getUsersController);
router.patch(
  "/users/:userId",
  validate(updateUserSchema),
  restrictTo(UserRole.Admin),
  updateUserController
);
router.patch(
  "/users/:userId/password",
  validate(updatePasswordSchema),
  updatePasswordController
);
router.delete(
  "/users/:userId",
  validate(softDeleteUserSchema),
  restrictTo(UserRole.Admin),
  softDeleteUserController
);
router.post(
  "/users/:userId/activity-log",
  validate(addActivityLogSchema),
  restrictTo(UserRole.Admin),
  addActivityLogController
);

// Admin routes
router.post(
  "/users",
  validate(createUserSchema),
  restrictTo(UserRole.Admin),
  createUserController
);
export { router as userRouter };
