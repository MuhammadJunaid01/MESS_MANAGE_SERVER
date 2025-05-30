"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../../middlewares/auth");
const validation_1 = require("../../middlewares/validation");
const mess_schema_1 = require("../../schemas/mess.schema");
const user_interface_1 = require("../User/user.interface");
const mess_controller_1 = require("./mess.controller");
const router = express_1.default.Router();
exports.messRouter = router;
// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later.",
});
// Protected routes (require authentication)
router.use(auth_1.protect);
// Mess routes
router.post("/", (0, validation_1.validate)(mess_schema_1.createMessSchema), (0, auth_1.restrictTo)(user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager), mess_controller_1.createMessController);
router.get("/:messId", getLimiter, (0, validation_1.validate)(mess_schema_1.getMessByIdSchema), mess_controller_1.getMessByIdController);
router.get("/", getLimiter, (0, validation_1.validate)(mess_schema_1.getMessesSchema), mess_controller_1.getMessesController);
router.patch("/:messId", (0, validation_1.validate)(mess_schema_1.updateMessSchema), (0, auth_1.restrictTo)(user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager), mess_controller_1.updateMessController);
router.delete("/:messId", (0, validation_1.validate)(mess_schema_1.deleteMessSchema), (0, auth_1.restrictTo)(user_interface_1.UserRole.Admin), mess_controller_1.deleteMessController);
