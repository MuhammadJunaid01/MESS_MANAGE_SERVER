"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
const databaseUrl = process.env.NODE_ENV === "development"
    ? process.env.DATABASE_URL_LOCAL
    : process.env.DATABASE_URL_PROD;
exports.default = {
    nodeEnv: process.env.NODE_ENV, // Environment: development, production, etc.
    port: process.env.PORT, // Application port
    databaseUrl: databaseUrl || "mongodb://localhost:27017/my-mess", // Database connection URL
    secretToken: process.env.SECRET_TOKEN, // JWT secret token
    secretRefreshToken: process.env.SECRET_REFRESH, // Refresh token secret
    emailUser: process.env.EMAIL_USER, // Email user for notifications
    emailPass: process.env.EMAIL_PASS, // Email password for notifications
    accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION, // Access token expiration time
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION, // Refresh token expiration time
};
