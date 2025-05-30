import { Schema, model } from "mongoose";
import {
  ActivityAction,
  ActivityEntity,
  IActivityLog,
} from "./activity.interface";

const ActivityLogSchema = new Schema<IActivityLog>({
  messId: { type: Schema.Types.ObjectId, ref: "Mess", required: true },
  entity: { type: String, enum: Object.values(ActivityEntity), required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  action: { type: String, enum: Object.values(ActivityAction), required: true },
  performedBy: {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
  },
  timestamp: { type: Date, required: true, default: Date.now },
  details: { type: String },
});

ActivityLogSchema.index({ messId: 1, timestamp: -1 });
ActivityLogSchema.index({ entity: 1, entityId: 1 });

const ActivityLogModel = model<IActivityLog>("ActivityLog", ActivityLogSchema);
export default ActivityLogModel;
