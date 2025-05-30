import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import { AppError } from "../errors";

// Zod validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        throw new AppError(
          `Validation failed: ${messages}`,
          400,
          "VALIDATION_ERROR"
        );
      }
      next(err);
    }
  };
};
