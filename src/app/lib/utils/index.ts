import { Response } from "express";

type SendResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
};
export const sendResponse = <T>(
  res: Response,
  { statusCode, message, success, data }: SendResponse<T>
) => {
  return res.status(statusCode).json({ success, message, data, statusCode });
};
