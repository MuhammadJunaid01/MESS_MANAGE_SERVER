import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

import config from "../../config";
import { TErrorSource } from "../../interfaces/global.interface";
import {
  handleCastError,
  handleMongooseDuplicateKeyError,
  handleMongooseValidationError,
  handleZodError,
} from "../../lib/errors";

export class AppError extends Error {
  public statusCode: number;
  public code: number | string | undefined;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    this.code = code;
  }
}
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let errorSources: TErrorSource[] = [
    { path: "", message: "Something went wrong" },
  ];
  let statusCode = error.statusCode || 500;
  let message = error.message || "Something went wrong";
  const stack = config.nodeEnv === "development" ? error.stack : null;

  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error instanceof mongoose.Error.ValidationError) {
    const simplifiedError = handleMongooseValidationError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error instanceof mongoose.Error.CastError) {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error.code === 11000 || error.code === "E11000") {
    const simplifiedError = handleMongooseDuplicateKeyError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error instanceof AppError) {
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
