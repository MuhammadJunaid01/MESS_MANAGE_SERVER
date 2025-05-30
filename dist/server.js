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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const database_1 = __importDefault(require("./app/config/database"));
const meal_corn_1 = require("./app/corn/meal.corn");
const logger_1 = require("./app/middlewares/logger");
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, database_1.default)();
        logger_1.logger.info("Connected to MongoDB");
        // Schedule the meal creation cron job
        (0, meal_corn_1.scheduleMealCreation)();
        logger_1.logger.info("Scheduled meal creation cron job");
        // Start Express server
        const port = Number(config_1.default.port) || 5000;
        app_1.default.listen(port, "0.0.0.0", () => {
            logger_1.logger.info(`Server running on http://localhost:${port}`);
        });
        // Graceful shutdown handlers
        const gracefulShutdown = () => __awaiter(void 0, void 0, void 0, function* () {
            logger_1.logger.info("Shutting down server...");
            yield mongoose_1.default.disconnect();
            logger_1.logger.info("MongoDB connection closed.");
            process.exit(0);
        });
        process.on("SIGINT", gracefulShutdown);
        process.on("SIGTERM", gracefulShutdown);
    }
    catch (error) {
        logger_1.logger.error(`Error during startup: ${error.message}`);
        process.exit(1);
    }
});
// Catch uncaught exceptions and unhandled promise rejections
process.on("uncaughtException", (err) => {
    logger_1.logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    logger_1.logger.error(`Unhandled Rejection: ${reason}`);
    process.exit(1);
});
// Start the server
startServer();
