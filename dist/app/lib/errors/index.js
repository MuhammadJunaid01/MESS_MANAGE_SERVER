"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodError = exports.handleMongooseValidationError = exports.handleMongooseDuplicateKeyError = exports.handleCastError = void 0;
const handleCastError = (error) => {
    const statusCode = 404;
    const message = "Invalid ID";
    const errorSources = [
        { path: error.path, message: error.message },
    ];
    return {
        statusCode,
        message,
        errorSources,
    };
};
exports.handleCastError = handleCastError;
const handleMongooseDuplicateKeyError = (error) => {
    const extractDuplicateKeyValue = (errorMessage) => {
        const regex = /dup key: \{ name: "(.*)" \}/;
        const match = errorMessage.match(regex);
        return match ? match[1] : null;
    };
    const duplicateValue = extractDuplicateKeyValue(error === null || error === void 0 ? void 0 : error.message);
    const statusCode = 404;
    const message = "can't create duplicate ";
    const errorSources = [
        {
            path: Object.keys(error.keyPattern)[0],
            message: `Duplicate value for field ${Object.keys(error.keyValue)[0]}: ${duplicateValue}`,
        },
    ];
    return {
        statusCode,
        message,
        errorSources,
    };
};
exports.handleMongooseDuplicateKeyError = handleMongooseDuplicateKeyError;
const handleMongooseValidationError = (error) => {
    const message = "validation error";
    const statusCode = 400;
    const errorSources = Object.values(error.errors).map((val) => {
        return {
            path: val === null || val === void 0 ? void 0 : val.path,
            message: val === null || val === void 0 ? void 0 : val.message,
        };
    });
    return {
        message,
        statusCode,
        errorSources,
    };
};
exports.handleMongooseValidationError = handleMongooseValidationError;
const handleZodError = (error) => {
    const statusCode = 400;
    const errorSources = error.issues.map((issue) => {
        var _a;
        return {
            path: issue === null || issue === void 0 ? void 0 : issue.path[((_a = issue === null || issue === void 0 ? void 0 : issue.path) === null || _a === void 0 ? void 0 : _a.length) - 1],
            message: issue === null || issue === void 0 ? void 0 : issue.message,
        };
    });
    return {
        statusCode,
        message: "validation error",
        errorSources,
    };
};
exports.handleZodError = handleZodError;
