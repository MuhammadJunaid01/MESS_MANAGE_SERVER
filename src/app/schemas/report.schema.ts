import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const getMealReportSchema = z.object({
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
    groupBy: z.enum(["mess", "user", "date"]).optional(),
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
