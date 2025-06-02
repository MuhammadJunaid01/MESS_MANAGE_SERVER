"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mSettingRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const middlewares_1 = require("../../middlewares");
const auth_1 = require("../../middlewares/auth");
const sanitize_middleware_1 = require("../../middlewares/sanitize.middleware");
const validation_1 = require("../../middlewares/validation");
const MSetting_schema_1 = require("../../schemas/MSetting.schema");
const user_interface_1 = require("../User/user.interface");
const MSetting_controller_1 = require("./MSetting.controller");
const router = express_1.default.Router();
exports.mSettingRouter = router;
// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later.",
});
// Protected routes (require authentication)
router.use(auth_1.protect);
// Setting routes
router.post("/", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(MSetting_schema_1.createSettingSchema), (0, middlewares_1.restrictTo)(user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager), MSetting_controller_1.createSettingController);
router.get("/:messId", getLimiter, sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(MSetting_schema_1.getSettingSchema), MSetting_controller_1.getSettingController);
router.patch("/:messId", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(MSetting_schema_1.updateSettingSchema), (0, middlewares_1.restrictTo)(user_interface_1.UserRole.Admin), MSetting_controller_1.updateSettingController);
