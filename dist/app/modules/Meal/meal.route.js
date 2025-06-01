"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mealRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const middlewares_1 = require("../../middlewares");
const auth_1 = require("../../middlewares/auth");
const sanitize_middleware_1 = require("../../middlewares/sanitize.middleware");
const validation_1 = require("../../middlewares/validation");
const meal_schema_1 = require("../../schemas/meal.schema");
const user_interface_1 = require("../User/user.interface");
const meal_controller_1 = require("./meal.controller");
const router = (0, express_1.Router)();
exports.mealRouter = router;
// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later.",
});
// Protected routes (require authentication)
router.use(auth_1.protect);
router.get("/create-for-one-month", meal_controller_1.createMealForOneMonthController);
router.post("/toggle", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(meal_schema_1.toggleMealsForDateRangeSchema), meal_controller_1.toggleMealsForDateRangeController);
// Meal routes
router.post("/", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(meal_schema_1.createMealSchema), meal_controller_1.createMealController);
router.get("/:mealId", getLimiter, sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(meal_schema_1.getMealByIdSchema), meal_controller_1.getMealByIdController);
router.get("/", getLimiter, sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(meal_schema_1.getMealsSchema), meal_controller_1.getMealsController);
router.patch("/:mealId", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(meal_schema_1.updateMealSchema), meal_controller_1.updateMealController);
router.delete("/:mealId", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(meal_schema_1.deleteMealSchema), (0, middlewares_1.restrictTo)(user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager), meal_controller_1.deleteMealController);
