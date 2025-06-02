"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleMealsForDateRangeSchema = exports.deleteMealSchema = exports.updateMealSchema = exports.getMealsSchema = exports.getMealDetailsByUserIdSchema = exports.getMealByIdSchema = exports.createMealSchema = void 0;
const zod_1 = require("zod");
const meal_interface_1 = require("../modules/Meal/meal.interface");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const mealEntrySchema = zod_1.z.object({
    type: zod_1.z.enum([meal_interface_1.MealType.Breakfast, meal_interface_1.MealType.Lunch, meal_interface_1.MealType.Dinner], {
        message: "Invalid meal type",
    }),
    isActive: zod_1.z.boolean(),
    numberOfMeals: zod_1.z
        .number({ message: "Number of meals must be a number" })
        .int({ message: "Number of meals must be an integer" }),
});
exports.createMealSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID"),
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID"),
        date: zod_1.z.string().datetime({ message: "Invalid date format" }),
        meals: zod_1.z.array(mealEntrySchema).min(1, "At least one meal is required"),
    }),
});
exports.getMealByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        mealId: zod_1.z.string().regex(objectIdRegex, "Invalid meal ID"),
    }),
});
exports.getMealDetailsByUserIdSchema = zod_1.z.object({
    query: zod_1.z
        .object({
        userId: zod_1.z
            .string({ required_error: "userId is required" })
            .regex(objectIdRegex, "Invalid user ID"),
        messId: zod_1.z
            .string({ required_error: "messId is required" })
            .regex(objectIdRegex, "Invalid mess ID"),
        from: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), {
            message: "Invalid from date format",
        }),
        to: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), {
            message: "Invalid to date format",
        }),
    })
        .refine((data) => !data.from || !data.to || new Date(data.from) <= new Date(data.to), {
        message: "from date must be before or equal to to date",
        path: ["from", "to"],
    }),
});
exports.getMealsSchema = zod_1.z.object({
    query: zod_1.z.object({
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID").optional(),
        userId: zod_1.z.string().regex(objectIdRegex, "Invalid user ID").optional(),
        dateFrom: zod_1.z
            .string()
            .datetime({ message: "Invalid dateFrom format" })
            .optional(),
        dateTo: zod_1.z
            .string()
            .datetime({ message: "Invalid dateTo format" })
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
exports.updateMealSchema = zod_1.z.object({
    params: zod_1.z.object({
        mealId: zod_1.z.string().regex(objectIdRegex, "Invalid meal ID"),
    }),
    body: zod_1.z.object({
        meals: zod_1.z
            .array(mealEntrySchema)
            .min(1, "At least one meal is required")
            .optional(),
        date: zod_1.z.string().datetime({ message: "Invalid date format" }).optional(),
    }),
});
exports.deleteMealSchema = zod_1.z.object({
    params: zod_1.z.object({
        mealId: zod_1.z.string().regex(objectIdRegex, "Invalid meal ID"),
    }),
});
exports.toggleMealsForDateRangeSchema = zod_1.z.object({
    body: zod_1.z.object({
        startDate: zod_1.z.string().datetime({ message: "Invalid startDate format" }),
        endDate: zod_1.z.string().datetime({ message: "Invalid endDate format" }),
        meals: zod_1.z.array(mealEntrySchema).min(1, "At least one meal is required"),
    }),
});
