import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error && typeof error === "object" && "errors" in error) {
        res.status(400).json({ error: (error as any).errors });
      } else {
        res.status(400).json({ error: "Validation error" });
      }
    }
  };

export default validate;
