import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const locationSchema = z.object({
  type: z.literal("Point").optional(),
  coordinates: z
    .array(z.number())
    .length(2)
    .refine(
      ([lon, lat]) => lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90,
      {
        message:
          "Invalid coordinates: longitude must be -180 to 180, latitude -90 to 90",
      }
    ),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
});

export const createMessSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    location: locationSchema,
  }),
});

export const getMessByIdSchema = z.object({
  params: z.object({
    messId: z.string().regex(objectIdRegex, "Invalid mess ID"),
  }),
});

export const getMessesSchema = z.object({
  query: z.object({
    status: z.enum(["active", "inactive"]).optional(),
    createdBy: z.string().regex(objectIdRegex, "Invalid user ID").optional(),
    lat: z.coerce
      .number()
      .refine((val) => val >= -90 && val <= 90, "Invalid latitude")
      .optional(),
    lon: z.coerce
      .number()
      .refine((val) => val >= -180 && val <= 180, "Invalid longitude")
      .optional(),
    maxDistance: z.coerce
      .number()
      .positive("Max distance must be positive")
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

export const updateMessSchema = z.object({
  params: z.object({
    messId: z.string().regex(objectIdRegex, "Invalid mess ID"),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name too long")
      .optional(),
    location: locationSchema.optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
});

export const deleteMessSchema = z.object({
  params: z.object({
    messId: z.string().regex(objectIdRegex, "Invalid mess ID"),
  }),
});
