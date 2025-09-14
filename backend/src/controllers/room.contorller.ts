import { Request, Response } from "express";
import { RoomModel } from "../models/room.model";

const ALPHANUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

let cachedGen: (() => string) | null = null;

async function generateRoomId(): Promise<string> {
  if (!cachedGen) {
    const { customAlphabet } = await import("nanoid");
    cachedGen = customAlphabet(ALPHANUM, 6);
  }
  return cachedGen!();
}

export const joinRoom = async (req: Request, res: Response) => {
  try {
    let { roomId } = req.body 


    if (!roomId) {
      roomId = await generateRoomId();
    }

    const room = await RoomModel.findOneAndUpdate(
      { roomId },
      {
        $setOnInsert: {
          roomId,
          drawingData: [],
          users: [],
          createdAt: new Date(),
        },
        $set: { lastActivity: new Date() },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    if (!room) {
      return res.status(500).json({ error: "Failed to create or fetch room" });
    }

    const userCount = Array.isArray(room.users) ? room.users.length : 0;

    return res.status(200).json({
      roomId: room.roomId,
      userCount,
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
