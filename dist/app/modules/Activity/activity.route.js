"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../../middlewares/auth");
const sanitize_middleware_1 = require("../../middlewares/sanitize.middleware");
const validation_1 = require("../../middlewares/validation");
const activity_schema_1 = require("../../schemas/activity.schema");
const activity_controller_1 = require("./activity.controller");
const router = (0, express_1.Router)();
exports.activityRouter = router;
// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later.",
});
// Protected routes (require authentication)
router.use(auth_1.protect);
// Recent activities route
router.get("/", getLimiter, sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(activity_schema_1.getRecentActivitiesSchema), activity_controller_1.getRecentActivitiesController);
