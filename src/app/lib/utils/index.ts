import { Response } from "express";
import CounterModel from "../../modules/Counter/counter.schema";

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
export const getNextMessId = async (): Promise<number> => {
  const counter = await CounterModel.findOneAndUpdate(
    { _id: "messId" },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequenceValue;
};
