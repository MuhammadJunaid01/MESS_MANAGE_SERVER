"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const auth_1 = require("../../middlewares/auth");
const validation_1 = require("../../middlewares/validation");
const user_schemas_1 = require("../../schemas/user.schemas");
const user_controller_1 = require("./user.controller");
const user_interface_1 = require("./user.interface");
const router = (0, express_1.Router)();
exports.userRouter = router;
// Public routes
router.post("/signup", (0, validation_1.validate)(user_schemas_1.signUpSchema), user_controller_1.signUpUserController);
router.post("/signin", (0, validation_1.validate)(user_schemas_1.signInSchema), user_controller_1.signInController);
router.post("/verify-otp", (0, validation_1.validate)(user_schemas_1.verifyOtpSchema), user_controller_1.verifyOtpController);
router.post("/forgot-password", (0, validation_1.validate)(user_schemas_1.forgotPasswordSchema), user_controller_1.forgotPasswordController);
router.post("/reset-password", (0, validation_1.validate)(user_schemas_1.resetPasswordSchema), user_controller_1.resetPasswordController);
// Protected routes (require authentication)
router.use(auth_1.protect);
// User routes
router.post("/join-mess", (0, validation_1.validate)(user_schemas_1.joinMessSchema), user_controller_1.joinMessController);
router.post("/users/:userId/approve-mess", (0, validation_1.validate)(user_schemas_1.approveMessJoinSchema), (0, middlewares_1.restrictTo)(user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager), user_controller_1.approveMessJoinController);
router.get("/users/:userId", (0, validation_1.validate)(user_schemas_1.getUserByIdSchema), user_controller_1.getUserByIdController);
router.get("/users/email", (0, validation_1.validate)(user_schemas_1.getUserByEmailSchema), user_controller_1.getUserByEmailController);
router.get("/users", (0, validation_1.validate)(user_schemas_1.getUsersSchema), user_controller_1.getUsersController);
router.patch("/users/:userId", (0, validation_1.validate)(user_schemas_1.updateUserSchema), (0, middlewares_1.restrictTo)(user_interface_1.UserRole.Admin), user_controller_1.updateUserController);
router.patch("/users/:userId/password", (0, validation_1.validate)(user_schemas_1.updatePasswordSchema), user_controller_1.updatePasswordController);
router.delete("/users/:userId", (0, validation_1.validate)(user_schemas_1.softDeleteUserSchema), (0, middlewares_1.restrictTo)(user_interface_1.UserRole.Admin), user_controller_1.softDeleteUserController);
router.post("/users/:userId/activity-log", (0, validation_1.validate)(user_schemas_1.addActivityLogSchema), (0, middlewares_1.restrictTo)(user_interface_1.UserRole.Admin), user_controller_1.addActivityLogController);
// Admin routes
router.post("/users", (0, validation_1.validate)(user_schemas_1.createUserSchema), (0, middlewares_1.restrictTo)(user_interface_1.UserRole.Admin), user_controller_1.createUserController);
