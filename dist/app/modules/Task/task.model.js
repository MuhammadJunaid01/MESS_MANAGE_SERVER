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
const interfaces_1 = require("../../interfaces");
const task_interface_1 = require("./task.interface");
const TaskSchema = new mongoose_1.Schema({
    messId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Mess", required: true },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: Object.values(task_interface_1.TaskType),
        default: task_interface_1.TaskType.GroceryBuyer,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(interfaces_1.IStatus),
        default: interfaces_1.IStatus.Approved,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String },
    urgency: {
        type: String,
        enum: Object.values(task_interface_1.Urgency),
        default: task_interface_1.Urgency.Medium,
    },
}, { timestamps: true });
const TaskModel = mongoose_1.default.model("Task", TaskSchema);
exports.default = TaskModel;
