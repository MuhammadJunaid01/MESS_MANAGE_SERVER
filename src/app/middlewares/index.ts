import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../modules/User/user.model";
import { AppError } from "./errors";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      id: string;
    };
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
export const roleMiddleware =
  (roles: string[]) => (req: Request, res: Response, next: Function) => {
    const user = (req as any).user;
    if (!roles.includes(user.role)) {
      throw new AppError("Access denied, you are not authorized", 403);
    }
    next();
  };

export const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
