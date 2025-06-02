"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingSchema = exports.updateSettingSchema = exports.createSettingSchema = void 0;
const zod_1 = require("zod");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
exports.createSettingSchema = zod_1.z.object({
    body: zod_1.z.object({
        breakfast: zod_1.z.boolean(),
        lunch: zod_1.z.boolean(),
        dinner: zod_1.z.boolean(),
        memberResponsibleForGrocery: zod_1.z.boolean(),
    }),
});
exports.updateSettingSchema = zod_1.z.object({
    params: zod_1.z.object({
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID"),
    }),
    body: zod_1.z
        .object({
        breakfast: zod_1.z.boolean().optional(),
        lunch: zod_1.z.boolean().optional(),
        dinner: zod_1.z.boolean().optional(),
        memberResponsibleForGrocery: zod_1.z.boolean().optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update",
    }),
});
exports.getSettingSchema = zod_1.z.object({
    params: zod_1.z.object({
        messId: zod_1.z.string().regex(objectIdRegex, "Invalid mess ID"),
    }),
});
