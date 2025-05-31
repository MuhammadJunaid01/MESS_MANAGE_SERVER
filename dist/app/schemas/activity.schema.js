"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivitiesSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const interfaces_1 = require("../interfaces");
const activity_interface_1 = require("../modules/Activity/activity.interface");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
exports.getRecentActivitiesSchema = zod_1.default.object({
    query: zod_1.default.object({
        messId: zod_1.default.string().regex(objectIdRegex, "Invalid mess ID").optional(),
        userId: zod_1.default.string().regex(objectIdRegex, "Invalid user ID").optional(),
        dateFrom: zod_1.default
            .string()
            .datetime({ message: "Invalid dateFrom format" })
            .optional(),
        dateTo: zod_1.default
            .string()
            .datetime({ message: "Invalid dateTo format" })
            .optional(),
        action: zod_1.default.enum(Object.values(interfaces_1.IStatus)).optional(),
        entity: zod_1.default
            .enum(Object.values(activity_interface_1.ActivityEntity))
            .optional(),
        limit: zod_1.default.coerce
            .number()
            .int()
            .positive("Limit must be a positive integer")
            .optional(),
        skip: zod_1.default.coerce
            .number()
            .int()
            .nonnegative("Skip must be non-negative")
            .optional(),
    }),
});
