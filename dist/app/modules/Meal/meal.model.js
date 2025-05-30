"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const meal_interface_1 = require("./meal.interface");
const MealSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    messId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Mess", required: true },
    date: { type: Date, required: true, default: new Date() },
    breakfast: {
        type: {
            type: String,
            enum: [meal_interface_1.MealType.Breakfast],
            default: meal_interface_1.MealType.Breakfast,
            required: true,
        },
        isActive: { type: Boolean, default: false },
    },
    lunch: {
        type: {
            type: String,
            enum: [meal_interface_1.MealType.Lunch],
            default: meal_interface_1.MealType.Lunch,
            required: true,
        },
        isActive: { type: Boolean, default: false },
    },
    dinner: {
        type: {
            type: String,
            enum: [meal_interface_1.MealType.Dinner],
            default: meal_interface_1.MealType.Dinner,
            required: true,
        },
        isActive: { type: Boolean, default: false },
    },
}, {
    timestamps: true,
});
const MealModel = mongoose_1.default.model("Meal", MealSchema);
exports.default = MealModel;
