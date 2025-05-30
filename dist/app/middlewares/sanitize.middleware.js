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
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
