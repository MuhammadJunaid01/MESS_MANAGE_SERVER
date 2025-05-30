"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const activity_interface_1 = require("./activity.interface");
const ActivityLogSchema = new mongoose_1.Schema({
    messId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Mess", required: true },
    entity: { type: String, enum: Object.values(activity_interface_1.ActivityEntity), required: true },
    entityId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    action: { type: String, enum: Object.values(activity_interface_1.ActivityAction), required: true },
    performedBy: {
        userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
    },
    timestamp: { type: Date, required: true, default: Date.now },
    details: { type: String },
});
ActivityLogSchema.index({ messId: 1, timestamp: -1 });
ActivityLogSchema.index({ entity: 1, entityId: 1 });
const ActivityLogModel = (0, mongoose_1.model)("ActivityLog", ActivityLogSchema);
exports.default = ActivityLogModel;
