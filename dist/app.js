"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dateFns = __importStar(require("date-fns"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const middlewares_1 = require("./app/middlewares");
const errors_1 = require("./app/middlewares/errors");
const logger_1 = require("./app/middlewares/logger");
const routes_1 = __importDefault(require("./app/routes"));
const app = (0, express_1.default)();
// Custom Morgan log format
const morganFormat = ":method :url :status :response-time ms";
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.locals.dateFns = dateFns;
// Integrate Morgan with Winston logger and custom format
app.use((0, morgan_1.default)(morganFormat, { stream: logger_1.stream }));
// Default root route
app.get("/", (req, res) => {
    logger_1.logger.info("Root route accessed");
    res.send("Welcome to the My Mess API 🤝");
});
// API routes
app.use("/api/v1", routes_1.default);
// 404 Middleware (Not Found)
app.use(middlewares_1.notFoundMiddleware);
// Error handler middleware (should come after notFoundMiddleware)
app.use(errors_1.errorHandler);
// Example log for server startup
logger_1.logger.info("Application setup complete");
exports.default = app;
