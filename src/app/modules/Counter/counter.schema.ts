import { Document, model, Schema } from "mongoose";
import { ICounter } from "./counter.interface";

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true }, // e.g., "messId"
  sequenceValue: { type: Number, default: 0 },
});

const CounterModel = model<ICounter>("Counter", CounterSchema);
export default CounterModel;
