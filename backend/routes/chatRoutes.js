import express from "express";
import {
  createOrGetChat,
  getUserChats,
  getMessages,
  sendMedia
} from "../controllers/chatController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/createChat", createOrGetChat);
router.get("/userChats/:userId", getUserChats);
router.get("/messages/:chatId", getMessages);
router.post(
  "/sendMedia",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  sendMedia
);

export default router;