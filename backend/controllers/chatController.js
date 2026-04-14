import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { decrypt } from "../utils/crypto.js";
import { translateText } from "../utils/translator.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

// CREATE OR GET CHAT
export const createOrGetChat = async (req, res) => {
  const { user1, user2 } = req.body;

  let chat = await Chat.findOne({
    members: { $all: [user1, user2] },
  });

  if (!chat) {
    chat = await Chat.create({ members: [user1, user2] });
  }

  res.json(chat);
};

// GET CHATS
export const getUserChats = async (req, res) => {
  const { userId } = req.params;

  const chats = await Chat.find({ members: userId })
    .populate("members", "name profileImage");

  const data = await Promise.all(
    chats.map(async (chat) => {
      const last = await Message.findOne({ chatId: chat._id })
        .sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        chatId: chat._id,
        readBy: { $ne: userId },
        sender: { $ne: userId },
      });

      return {
        ...chat._doc,
        unreadCount,
        lastMessage: last
          ? {
              ...last._doc,
              text: last.text ? decrypt(last.text) : "",
            }
          : null,
      };
    })
  );
  data.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || a.updatedAt;
    const bTime = b.lastMessage?.createdAt || b.updatedAt;

    return new Date(bTime) - new Date(aTime);
  });

  res.json(data);
};

// GET MESSAGES
export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const { viewerId } = req.query;

  const viewer = await User.findById(viewerId);

  const messages = await Message.find({ chatId, deletedFor: { $ne: viewerId } })
    .sort({ createdAt: 1 })
    .populate("sender", "languageCode");

  const processed = await Promise.all(
    messages.map(async (m) => {
      let text = m.text ? decrypt(m.text) : "";

      if (viewer && m.sender.languageCode !== viewer.languageCode) {
        text = await translateText(text, viewer.languageCode);
      }

      return {
        ...m._doc,
        text,
      };
    })
  );

  res.json(processed);
};

export const sendMedia = async (req, res) => {
  const io = req.app.get("io");
  try {
    const { chatId, sender } = req.body;

    const files = req.files;

    let mediaUrls = [];

    // 🔥 IMAGES
    if (files.images) {
      for (let file of files.images) {
        const result = await uploadToCloudinary(
          file.buffer,
          "chat/images",
          "image"
        );

        mediaUrls.push(result.secure_url);
      }
    }

    // 🔥 VIDEO
    if (files.video) {
      const file = files.video[0];

      const result = await uploadToCloudinary(
        file.buffer,
        "chat/videos",
        "video"
      );

      mediaUrls.push(result.secure_url);
    }

    // 🔥 SAVE MESSAGES
    const messages = [];

    for (let url of mediaUrls) {
      const msg = await Message.create({
        chatId,
        sender,
        media: url,
      });
const populatedMsg = await Message.findById(msg._id)
  .populate("sender", "_id name profileImage");

io.to(chatId).emit("receiveMessage", populatedMsg);
      messages.push(msg);
    }

    res.json(messages);

  } catch (err) {
    console.log("MEDIA ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};