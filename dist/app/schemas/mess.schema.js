"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessSchema = exports.updateMessSchema = exports.getMessesSchema = exports.getMessByIdSchema = exports.createMessSchema = exports.joinMessSchema = void 0;
const zod_1 = require("zod");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const locationSchema = zod_1.z.object({
    type: zod_1.z.literal("Point").optional(),
    coordinates: zod_1.z
        .array(zod_1.z.number())
        .length(2)
        .refine(([lon, lat]) => lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90, {
        message: "Invalid coordinates: longitude must be -180 to 180, latitude -90 to 90",
    }),
    address: zod_1.z.string().max(255).optional(),
    city: zod_1.z.string().max(100).optional(),
    state: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().max(100).optional(),
    postalCode: zod_1.z.string().max(20).optional(),
});
exports.joinMessSchema = zod_1.z.object({
    body: zod_1.z.object({
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID"),
    }),
});
exports.createMessSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required").max(100, "Name too long"),
        location: locationSchema,
    }),
});
exports.getMessByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID"),
    }),
});
exports.getMessesSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.enum(["active", "inactive"]).optional(),
        createdBy: zod_1.z.string().regex(objectIdRegex, "Invalid user ID").optional(),
        lat: zod_1.z.coerce
            .number()
            .refine((val) => val >= -90 && val <= 90, "Invalid latitude")
            .optional(),
        lon: zod_1.z.coerce
            .number()
            .refine((val) => val >= -180 && val <= 180, "Invalid longitude")
            .optional(),
        maxDistance: zod_1.z.coerce
            .number()
            .positive("Max distance must be positive")
            .optional(),
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
exports.updateMessSchema = zod_1.z.object({
    params: zod_1.z.object({
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID"),
    }),
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, "Name is required")
            .max(100, "Name too long")
            .optional(),
        location: locationSchema.optional(),
        status: zod_1.z.enum(["active", "inactive"]).optional(),
    }),
});
exports.deleteMessSchema = zod_1.z.object({
    params: zod_1.z.object({
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID"),
    }),
});
