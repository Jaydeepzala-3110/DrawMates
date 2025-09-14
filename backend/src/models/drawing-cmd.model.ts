import mongoose from "mongoose";

export const DrawingCommandSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["stroke", "clear"],
  },
  data: {
    color: String,
    width: Number,
    height: Number,
    points: [Number],
    timestamp: Date,
  },
});

export const DrawingCommandModel = mongoose.model(
  "drawing-cmd",
  DrawingCommandSchema
);
("");
