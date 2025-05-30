"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const config_1 = __importDefault(require("../../config"));
const errors_1 = require("../../lib/errors");
class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        this.code = code;
    }
}
exports.AppError = AppError;
const errorHandler = (error, req, res, next) => {
    let errorSources = [
        { path: "", message: "Something went wrong" },
    ];
    let statusCode = error.statusCode || 500;
    let message = error.message || "Something went wrong";
    const stack = config_1.default.nodeEnv === "development" ? error.stack : null;
    if (error instanceof zod_1.ZodError) {
        const simplifiedError = (0, errors_1.handleZodError)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (error instanceof mongoose_1.default.Error.ValidationError) {
        const simplifiedError = (0, errors_1.handleMongooseValidationError)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (error instanceof mongoose_1.default.Error.CastError) {
        const simplifiedError = (0, errors_1.handleCastError)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (error.code === 11000 || error.code === "E11000") {
        const simplifiedError = (0, errors_1.handleMongooseDuplicateKeyError)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        errorSources = [{ path: "", message: error.message }];
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        stack,
    });
};
exports.errorHandler = errorHandler;
