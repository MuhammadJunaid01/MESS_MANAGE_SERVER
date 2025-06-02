"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SettingSchema = new mongoose_1.Schema({
    messId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Mess",
        required: true,
        unique: true,
    },
    breakfast: { type: Boolean, required: true, default: true },
    lunch: { type: Boolean, required: true, default: true },
    dinner: { type: Boolean, required: true, default: true },
    memberResponsibleForGrocery: {
        type: Boolean,
        required: true,
        default: false,
    },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
SettingSchema.index({ messId: 1 }, { unique: true });
const SettingModel = (0, mongoose_1.model)("Setting", SettingSchema);
exports.default = SettingModel;
