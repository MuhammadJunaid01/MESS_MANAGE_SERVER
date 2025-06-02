"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMealReportSchema = void 0;
const zod_1 = require("zod");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
exports.getMealReportSchema = zod_1.z.object({
    query: zod_1.z.object({
        // messId: z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID").optional(),
        dateFrom: zod_1.z
            .string()
            .datetime({ message: "Invalid dateFrom format" })
            .optional(),
        dateTo: zod_1.z
            .string()
            .datetime({ message: "Invalid dateTo format" })
            .optional(),
        groupBy: zod_1.z.enum(["mess", "user", "date"]).optional(),
        limit: zod_1.z.coerce
            .number()
            .int()
            .positive("Limit must be a positive integer")
            .optional(),
        skip: zod_1.z.coerce
            .number()
            .int()
            .nonnegative("Skip must be non-negative")
            .optional(),
    }),
});
