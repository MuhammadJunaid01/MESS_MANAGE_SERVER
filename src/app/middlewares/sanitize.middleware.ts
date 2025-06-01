import { NextFunction, Request, Response } from "express";
import sanitizeHtml from "sanitize-html";

const sanitizeObject = (obj: any): any => {
  if (typeof obj === "string") {
    return sanitizeHtml(obj, {
      allowedTags: [],
      allowedAttributes: {},
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === "object" && obj !== null) {
    const sanitizedObj: any = {};
    for (const key in obj) {
      sanitizedObj[key] = sanitizeObject(obj[key]);
    }
    return sanitizedObj;
  }
  return obj;
};

export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
