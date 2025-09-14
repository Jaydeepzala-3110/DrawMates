import { Server } from 'socket.io';
import { RoomModel } from '../models/room.model';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Socket connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room event
    socket.on('join-room', async (data, ack) => {
      const roomId = String(data?.roomId || "").trim();
      if (!/^[A-Za-z0-9]{6,8}$/.test(roomId)) {
        return ack?.({ ok: false, error: 'invalid_roomId' });
      }
    
      try {
        // 1) ensure room exists (create if missing)
        await RoomModel.findOneAndUpdate(
          { roomId },
          {
            $setOnInsert: { roomId, drawingData: [], users: [], createdAt: new Date() },
            $set: { lastActivity: new Date() },
          },
          { upsert: true }
        );
    
        // 2) atomically add socket user only if not already present and return updated doc
        const updatedRoom = await RoomModel.findOneAndUpdate(
          { roomId, 'users.userId': { $ne: socket.id } }, // only if user not present
          {
            $push: {
              users: { userId: socket.id, joinedAt: new Date(), cursor: { x: 0, y: 0, visible: false } }
            },
            $set: { lastActivity: new Date() }
          },
          { new: true } // return updated doc
        ) || (await RoomModel.findOne({ roomId }).lean()); // if user existed, fetch room
    
        // 3) join socket.io room after DB update
        socket.join(roomId);
    
        // 4) send history and meta back to joining client using ack (or socket.emit)
        const history = Array.isArray(updatedRoom?.drawingData) ? updatedRoom.drawingData : [];
        const userCount = Array.isArray(updatedRoom?.users) ? updatedRoom.users.length : 0;
        ack?.({ ok: true, roomId, history, userCount, userId: socket.id });
    
        // 5) notify other clients in room about the new user and updated count
        socket.to(roomId).emit('user-joined', { userId: socket.id, userCount });
    
      } catch (err) {
        console.error('Error join-room', err);
        ack?.({ ok: false, error: 'server_error' });
      }
    });
    // Drawing events
    socket.on('draw-start', (data) => {
      const { roomId, point, color, width } = data;
      socket.to(roomId).emit('draw-start', {
        userId: socket.id,
        point,
        color,
        width
      });
    });

    socket.on('draw-move', (data) => {
      const { roomId, point } = data;
      socket.to(roomId).emit('draw-move', {
        userId: socket.id,
        point
      });
    });

    socket.on('draw-end', async (data) => {
      const { roomId, points, color, width } = data;
      
      // Save drawing command to database
      try {
        await RoomModel.findOneAndUpdate(
          { roomId },
          { 
            $push: { 
              drawingData: {
                type: 'stroke',
                data: { points, color, width, timestamp: new Date() },
                userId: socket.id
              }
            },
            $set: { lastActivity: new Date() }
          }
        );
      } catch (error) {
        console.error('Error saving drawing:', error);
      }

      socket.to(roomId).emit('draw-end', {
        userId: socket.id,
        points,
        color,
        width
      });
    });

    // Cursor movement
    socket.on('cursor-move', (data) => {
      const { roomId, x, y } = data;
      
      // Update cursor position in database
      RoomModel.findOneAndUpdate(
        { roomId, 'users.userId': socket.id },
        { 
          $set: { 
            'users.$.cursor': { x, y, visible: true },
            lastActivity: new Date()
          }
        }
      ).catch(console.error);

      socket.to(roomId).emit('cursor-move', {
        userId: socket.id,
        x,
        y
      });
    });

    // Clear canvas
    socket.on('clear-canvas', async (data) => {
      const { roomId } = data;
      
      try {
        await RoomModel.findOneAndUpdate(
          { roomId },
          { 
            $push: { 
              drawingData: {
                type: 'clear',
                data: { timestamp: new Date() },
                userId: socket.id
              }
            },
            $set: { lastActivity: new Date() }
          }
        );
      } catch (error) {
        console.error('Error clearing canvas:', error);
      }

      socket.to(roomId).emit('clear-canvas', {
        userId: socket.id
      });
    });

    // Handle user disconnect
   
  });

  return io;
};

// Get the io instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};