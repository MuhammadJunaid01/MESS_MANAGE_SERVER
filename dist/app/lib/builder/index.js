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
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const errors_1 = require("../../middlewares/errors");
const user_model_1 = __importDefault(require("../../modules/User/user.model"));
const JWT_SECRET = config_1.default.secretToken || "your_jwt_secret";
const JWT_REFRESH_SECRET = config_1.default.secretRefreshToken || "your_refresh_jwt_secret";
const ACCESS_TOKEN_EXPIRY = config_1.default.accessTokenExpiration || "1h";
const REFRESH_TOKEN_EXPIRY = config_1.default.refreshTokenExpiration || "7d";
const generateAccessToken = (userId, role) => {
    try {
        const payload = { userId, role };
        // Generate access token with short expiration time (e.g., 1 hour)
        const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: "1h", // Access token expires in 1 hour
        });
        return accessToken;
    }
    catch (error) {
        throw new errors_1.AppError("Failed to generate access token", 500);
    }
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = { userId };
        // Generate refresh token with longer expiration time
        const refreshToken = jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, {
            expiresIn: "7d", // Refresh token expires in 7 days
        });
        // Optionally store the refresh token in the database, associated with the user
        yield user_model_1.default.findByIdAndUpdate(userId, { refreshToken });
        return refreshToken;
    }
    catch (error) {
        throw new errors_1.AppError("Failed to generate refresh token", 500);
    }
});
exports.generateRefreshToken = generateRefreshToken;
