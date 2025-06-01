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
const errors_1 = require("../errors");
// JWT authentication middleware
exports.protect = (0, __1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearers", "");
    if (!token) {
        throw new errors_1.AppError("No token provided", 401, "UNAUTHORIZED");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.secretToken || "secret");
        req.user = decoded; // Set user data from JWT payload
        next();
    }
    catch (err) {
        throw new errors_1.AppError("Invalid token", 401, "INVALID_TOKEN");
    }
}));
// Role-based authorization middleware
