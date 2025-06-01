import cors from "cors";
import * as dateFns from "date-fns";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { notFoundMiddleware } from "./app/middlewares";
import { errorHandler } from "./app/middlewares/errors";
import { logger, stream } from "./app/middlewares/logger";
import router from "./app/routes";

const app: Application = express();

// Custom Morgan log format
const morganFormat = ":method :url :status :response-time ms";

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.locals.dateFns = dateFns;

// Integrate Morgan with Winston logger and custom format
app.use(morgan(morganFormat, { stream }));

// Default root route
app.get("/", (req: Request, res: Response) => {
  logger.info("Root route accessed");
  res.send("Welcome to the My Mess API 🤝");
});

// API routes
app.use("/api/v1", router);

// 404 Middleware (Not Found)
app.use(notFoundMiddleware);

// Error handler middleware (should come after notFoundMiddleware)
app.use(errorHandler);

// Example log for server startup
logger.info("Application setup complete");

export default app;
