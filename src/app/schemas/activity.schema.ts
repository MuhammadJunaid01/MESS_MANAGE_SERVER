import z from "zod";
import { IStatus } from "../interfaces/global.interface";
import { ActivityEntity } from "../modules/Activity/activity.interface";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const getRecentActivitiesSchema = z.object({
  query: z.object({
    messId: z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
    userId: z.string().regex(objectIdRegex, "Invalid user ID").optional(),
    dateFrom: z
      .string()
      .datetime({ message: "Invalid dateFrom format" })
      .optional(),
    dateTo: z
      .string()
      .datetime({ message: "Invalid dateTo format" })
      .optional(),
    action: z.enum(Object.values(IStatus) as [string, ...string[]]).optional(),
    entity: z
      .enum(Object.values(ActivityEntity) as [string, ...string[]])
      .optional(),
    limit: z.coerce
      .number()
      .int()
      .positive("Limit must be a positive integer")
      .optional(),
    skip: z.coerce
      .number()
      .int()
      .nonnegative("Skip must be non-negative")
      .optional(),
  }),
});
