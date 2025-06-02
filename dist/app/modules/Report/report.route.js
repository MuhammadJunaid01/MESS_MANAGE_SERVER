"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../../middlewares/auth");
const sanitize_middleware_1 = require("../../middlewares/sanitize.middleware");
const validation_1 = require("../../middlewares/validation");
const report_schema_1 = require("../../schemas/report.schema");
const report_controller_1 = require("./report.controller");
const router = (0, express_1.Router)();
exports.reportRouter = router;
// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later.",
});
// Protected routes (require authentication)
router.use(auth_1.protect);
// Meal routes
router.get("/", getLimiter, sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(report_schema_1.getMealReportSchema), report_controller_1.generateMealReportController);
router.get("/users-meal-report", getLimiter, sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(report_schema_1.getMealReportSchema), report_controller_1.generateUsersMealReportController);
