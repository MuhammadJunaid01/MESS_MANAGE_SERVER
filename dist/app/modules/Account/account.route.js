"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../../middlewares/auth");
const sanitize_middleware_1 = require("../../middlewares/sanitize.middleware");
const validation_1 = require("../../middlewares/validation");
const account_schema_1 = require("../../schemas/account.schema");
const user_interface_1 = require("../User/user.interface");
const account_controller_1 = require("./account.controller");
const router = express_1.default.Router();
exports.accountRouter = router;
// Rate limiter for GET requests (100 requests per 15 minutes per IP)
const getLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later.",
});
// Protected routes (require authentication)
router.use(auth_1.protect);
// Account routes
router.post("/", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(account_schema_1.createAccountSchema), (0, auth_1.restrictTo)(user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager), account_controller_1.createAccountController);
router.get("/:accountId", getLimiter, sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(account_schema_1.getAccountByIdSchema), account_controller_1.getAccountByIdController);
router.get("/", getLimiter, sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(account_schema_1.getAccountsSchema), account_controller_1.getAccountsController);
router.delete("/:accountId", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(account_schema_1.deleteAccountSchema), (0, auth_1.restrictTo)(user_interface_1.UserRole.Admin), account_controller_1.deleteAccountController);
// Transaction routes (nested under account)
router.post("/:accountId/transactions", sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(account_schema_1.createTransactionSchema), (0, auth_1.restrictTo)(user_interface_1.UserRole.Admin, user_interface_1.UserRole.Manager), account_controller_1.createTransactionController);
router.get("/:accountId/transactions", getLimiter, sanitize_middleware_1.sanitizeInput, (0, validation_1.validate)(account_schema_1.getTransactionsSchema), account_controller_1.getTransactionsController);
