import { Router } from 'express';
import RoomRouter from "../routes/room.route"; 

const router = Router();

router.use('/room', RoomRouter);

export default router;