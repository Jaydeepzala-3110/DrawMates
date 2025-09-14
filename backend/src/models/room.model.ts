import { Schema, model } from "mongoose";
import {  DrawingCommandSchema } from "./drawing-cmd.model";

const roomSchema = new Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  lastActivity: {
    type: Date,
  },
  drawingData: [DrawingCommandSchema],
  users: [
    {
      userId: String,
      joinedAt: Date,
      cursor: {
        x: Number,
        y: Number,
        visible: Boolean,
      },
    },
  ],
});

export const RoomModel = model("Room", roomSchema);
