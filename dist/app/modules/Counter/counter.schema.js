"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CounterSchema = new mongoose_1.Schema({
    _id: { type: String, required: true }, // e.g., "messId"
    sequenceValue: { type: Number, default: 0 },
});
const CounterModel = (0, mongoose_1.model)("Counter", CounterSchema);
exports.default = CounterModel;
