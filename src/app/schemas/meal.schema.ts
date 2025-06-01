import { z } from "zod";
import { MealType } from "../modules/Meal/meal.interface";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const mealEntrySchema = z.object({
  type: z.enum([MealType.Breakfast, MealType.Lunch, MealType.Dinner], {
    message: "Invalid meal type",
  }),
  isActive: z.boolean(),
  numberOfMeals: z
    .number({ message: "Number of meals must be a number" })
    .int({ message: "Number of meals must be an integer" }),
});

export const createMealSchema = z.object({
  body: z.object({
    userId: z.string().regex(objectIdRegex, "Invalid user ID"),
    messId: z.string().regex(objectIdRegex, "Invalid mess ID"),
    date: z.string().datetime({ message: "Invalid date format" }),
    meals: z.array(mealEntrySchema).min(1, "At least one meal is required"),
  }),
});

export const getMealByIdSchema = z.object({
  params: z.object({
    mealId: z.string().regex(objectIdRegex, "Invalid meal ID"),
  }),
});

export const getMealsSchema = z.object({
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

export const updateMealSchema = z.object({
  params: z.object({
    mealId: z.string().regex(objectIdRegex, "Invalid meal ID"),
  }),
  body: z.object({
    meals: z
      .array(mealEntrySchema)
      .min(1, "At least one meal is required")
      .optional(),
    date: z.string().datetime({ message: "Invalid date format" }).optional(),
  }),
});

export const deleteMealSchema = z.object({
  params: z.object({
    mealId: z.string().regex(objectIdRegex, "Invalid meal ID"),
  }),
});

export const toggleMealsForDateRangeSchema = z.object({
  body: z.object({
    startDate: z.string().datetime({ message: "Invalid startDate format" }),
    endDate: z.string().datetime({ message: "Invalid endDate format" }),
    meals: z.array(mealEntrySchema).min(1, "At least one meal is required"),
  }),
});
