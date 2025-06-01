"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const __1 = require("..");
const config_1 = __importDefault(require("../../config"));
const user_model_1 = __importDefault(require("../../modules/User/user.model"));
const errors_1 = require("../errors");
// JWT authentication middleware
exports.protect = (0, __1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract the token from the Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new errors_1.AppError("No or invalid token provided", 401, "UNAUTHORIZED");
    }
    console.log("HIT PROTECT");
    const token = authHeader.replace("Bearer ", ""); // Correctly replace "Bearer " prefix
    if (!token) {
        throw new errors_1.AppError("No token provided", 401, "UNAUTHORIZED");
    }
    try {
        // Verify the token using the secret key
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.secretToken || "secret" // Use secret from config or fallback to "secret"
        );
        const user = yield user_model_1.default.findById(decoded.userId);
        if (!user) {
            throw new errors_1.AppError("User not found", 404, "USER_NOT_FOUND");
        }
        // if (user.role === UserRole.Admin);
        if (user.messId && user._id) {
            console.log("USER MESS ID FROMhgjhgjhgjhgjghjhgjghjhgjhg  PROTEXYT", user === null || user === void 0 ? void 0 : user.messId);
            const authUser = {
                userId: user === null || user === void 0 ? void 0 : user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                messId: user.messId,
            };
            req.user = authUser;
        }
        else {
            req.user = {
                userId: user._id,
                name: user === null || user === void 0 ? void 0 : user.name,
                email: user === null || user === void 0 ? void 0 : user.email,
                role: user === null || user === void 0 ? void 0 : user.role,
            };
            console.log("decoded", decoded);
        }
        // Attach decoded user data to the request object
        // Proceed to the next middleware
        next();
    }
    catch (err) {
        console.error("JWT verification error:", err); // Log the error for debugging
        throw new errors_1.AppError("Invalid token", 401, "INVALID_TOKEN");
    }
}));
// Role-based authorization middleware
