"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const middlewares_1 = require("../../middlewares");
const auth_1 = require("../../middlewares/auth");
const sanitize_middleware_1 = require("../../middlewares/sanitize.middleware");
const validation_1 = require("../../middlewares/validation");
const expense_schema_1 = require("../../schemas/expense.schema");
const user_interface_1 = require("../User/user.interface");
const expense_controller_1 = require("./expense.controller");
const router = (0, express_1.Router)();
exports.expenseRouter = router;
// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later.",
});
// Protected routes (require authentication)
router.use(auth_1.protect);
// Expense routes
router.post("/", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(expense_schema_1.createExpenseSchema), expense_controller_1.createExpenseController);
router.get("/:expenseId", getLimiter, sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(expense_schema_1.getExpenseByIdSchema), expense_controller_1.getExpenseByIdController);
router.get("/", getLimiter, sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(expense_schema_1.getExpensesSchema), expense_controller_1.getExpensesController);
router.patch("/:expenseId", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(expense_schema_1.updateExpenseSchema), expense_controller_1.updateExpenseController);
router.patch("/:expenseId/status", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(expense_schema_1.updateExpenseStatusSchema), (0, middlewares_1.restrictTo)(user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager), expense_controller_1.updateExpenseStatusController);
router.delete("/:expenseId", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(expense_schema_1.deleteExpenseSchema), (0, middlewares_1.restrictTo)(user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager), expense_controller_1.deleteExpenseController);
