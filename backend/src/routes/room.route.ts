// src/routes/room.route.ts
import { Router } from "express";
import { joinRoom } from "../controllers/room.contorller";
const router = Router();

// example route
router.post("/join", joinRoom);

export default router;
