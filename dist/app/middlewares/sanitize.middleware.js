"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const sanitizeObject = (obj) => {
    if (typeof obj === "string") {
        return (0, sanitize_html_1.default)(obj, {
            allowedTags: [],
            allowedAttributes: {},
        });
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }
    if (typeof obj === "object" && obj !== null) {
        const sanitizedObj = {};
        for (const key in obj) {
            sanitizedObj[key] = sanitizeObject(obj[key]);
        }
        return sanitizedObj;
    }
    return obj;
};
const sanitizeInput = (req, res, next) => {
    if (req.body && typeof req.body === "object") {
        for (const key in req.body) {
            req.body[key] = sanitizeObject(req.body[key]);
        }
    }
    if (req.query && typeof req.query === "object") {
        for (const key in req.query) {
            req.query[key] = sanitizeObject(req.query[key]);
        }
    }
    if (req.params && typeof req.params === "object") {
        for (const key in req.params) {
            req.params[key] = sanitizeObject(req.params[key]);
        }
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
