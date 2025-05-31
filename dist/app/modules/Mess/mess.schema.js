"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LocationSchema = new mongoose_1.Schema({
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
            validator: (v) => {
                const [lon, lat] = v;
                return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
            },
            message: "Invalid coordinates: longitude must be -180 to 180, latitude -90 to 90",
        },
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    postalCode: { type: String, trim: true },
});
const MessSchema = new mongoose_1.Schema({
    messId: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true, unique: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    location: { type: LocationSchema, required: true },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});
// Indexes
MessSchema.index({ messId: 1 }, { unique: true });
MessSchema.index({ name: 1 }, { unique: true });
MessSchema.index({ "location.coordinates": "2dsphere" });
MessSchema.index({ createdBy: 1 });
MessSchema.index({ status: 1, isDeleted: 1 });
const MessModel = (0, mongoose_1.model)("Mess", MessSchema);
exports.default = MessModel;
