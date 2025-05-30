import mongoose, { Schema } from "mongoose";
import { IStatus } from "../../interfaces";
import { ITask, TaskType, Urgency } from "./task.interface";

const TaskSchema = new Schema<ITask>(
  {
    messId: { type: Schema.Types.ObjectId, ref: "Mess", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: Object.values(TaskType),
      default: TaskType.GroceryBuyer,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(IStatus),
      default: IStatus.Approved,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String },
    urgency: {
      type: String,
      enum: Object.values(Urgency),
      default: Urgency.Medium,
    },
  },
  { timestamps: true }
);
const TaskModel = mongoose.model<ITask>("Task", TaskSchema);
export default TaskModel;
