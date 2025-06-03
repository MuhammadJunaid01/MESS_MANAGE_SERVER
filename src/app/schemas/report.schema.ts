import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const groceryReportQuerySchema = z.object({
  query: z.object({
    messId: z
      .string()
      .optional()
      .refine((val) => !val || /^[0-9a-fA-F]{24}$/.test(val), {
        message: "Invalid mess ID format",
      }),
    from: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid from format",
      }),
    to: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid to format",
      }),
  }),
});
export const getMealReportSchema = z.object({
  query: z.object({
    // messId: z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
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
