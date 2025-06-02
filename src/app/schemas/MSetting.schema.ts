import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createSettingSchema = z.object({
  body: z.object({
    breakfast: z.boolean(),
    lunch: z.boolean(),
    dinner: z.boolean(),
    memberResponsibleForGrocery: z.boolean(),
  }),
});

export const updateSettingSchema = z.object({
  params: z.object({
    messId: z.string().regex(objectIdRegex, "Invalid mess ID"),
  }),
  body: z
    .object({
      breakfast: z.boolean().optional(),
      lunch: z.boolean().optional(),
      dinner: z.boolean().optional(),
      memberResponsibleForGrocery: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const getSettingSchema = z.object({
  params: z.object({
    messId: z.string().regex(objectIdRegex, "Invalid mess ID"),
  }),
});
