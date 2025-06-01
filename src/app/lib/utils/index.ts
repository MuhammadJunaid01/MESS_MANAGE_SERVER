import { addMonths, getDaysInMonth, startOfMonth } from "date-fns";
import { Response } from "express";
import CounterModel from "../../modules/Counter/counter.schema";
export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
type SendResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
  meta?: IMeta;
};
export const sendResponse = <T>(
  res: Response,
  { statusCode, message, success, data, meta }: SendResponse<T>
) => {
  return res
    .status(statusCode)
    .json({ success, message, data, statusCode, meta });
};
export const getNextMessId = async (): Promise<number> => {
  const counter = await CounterModel.findOneAndUpdate(
    { _id: "messId" },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequenceValue;
};
export const getNextMonthDetails = () => {
  // Get the first day of the next month
  const nextMonthStart = startOfMonth(addMonths(new Date(), 1));

  // Get the total number of days in the next month
  const daysInNextMonth = getDaysInMonth(nextMonthStart);

  // Extract the year and month
  const year = nextMonthStart.getFullYear();
  const month = nextMonthStart.getMonth();

  return { year, month, daysInNextMonth };
};
