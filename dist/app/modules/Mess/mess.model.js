"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LocationSchema = new mongoose_1.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { _id: false });
// Schema for Mess
const MessSchema = new mongoose_1.Schema({
    messId: { type: String, unique: true },
    name: { type: String, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: LocationSchema, required: true },
}, { timestamps: true });
MessSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = this;
        if (!doc.messId) {
            // Find the latest messId and generate the next one
            const lastMess = yield MessModel.findOne().sort({ messId: -1 }).exec();
            let nextId = 1;
            if (lastMess === null || lastMess === void 0 ? void 0 : lastMess.messId) {
                // Convert the last messId to a number and increment
                nextId = parseInt(lastMess.messId, 10) + 1;
            }
            // Pad the nextId with leading zeros
            doc.messId = nextId.toString().padStart(2, "0");
        }
        next();
    });
});
// Model for Mess
const MessModel = (0, mongoose_1.model)("Mess", MessSchema);
exports.default = MessModel;
