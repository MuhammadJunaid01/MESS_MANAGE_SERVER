import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import connectDB from "./app/config/database";
import { logger } from "./app/middlewares/logger";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    logger.info("Connected to MongoDB");

    // Start Express server
    const port = Number(config.port) || 5000;
    app.listen(port, "0.0.0.0", () => {
      logger.info(`Server running on http://localhost:${port}`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async () => {
      logger.info("Shutting down server...");
      await mongoose.disconnect();
      logger.info("MongoDB connection closed.");
      process.exit(0);
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  } catch (error) {
    logger.error(`Error during startup: ${(error as Error).message}`);
    process.exit(1);
  }
};

// Catch uncaught exceptions and unhandled promise rejections
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
process.on("unhandledRejection", (reason: unknown) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

// Start the server
startServer();
