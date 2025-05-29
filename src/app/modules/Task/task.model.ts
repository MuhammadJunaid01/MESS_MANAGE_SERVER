import mongoose, { Schema } from "mongoose";
import { ITask } from "./task.interface";

const TaskSchema = new Schema<ITask>(
  {
    messId: { type: Schema.Types.ObjectId, ref: "Mess", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["GroceryBuyer", "UtilityManager", "MealManager"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);
const TaskModel = mongoose.model<ITask>("Task", TaskSchema);
export default TaskModel;
