import Message from "../models/Message.js";
import { encrypt, decrypt } from "../utils/crypto.js";

let onlineUsers = {}; // ✅ FIXED (global)

export const chatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 connected", socket.id);

    /* ---------------- USER ONLINE ---------------- */
    socket.on("addUser", (userId) => {
      onlineUsers[userId] = socket.id;
    });

    socket.on("disconnect", () => {
      for (let userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
        }
      }
      console.log("🔴 disconnected", socket.id);
    });

    /* ---------------- JOIN CHAT ---------------- */
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    /* ---------------- SEND MESSAGE ---------------- */
    socket.on("sendMessage", async (data) => {
      try {
        const { chatId, sender, text, media, tempId } = data;

        const encryptedText = text ? encrypt(text) : null;

        const msg = await Message.create({
          chatId,
          sender,
          text: encryptedText,
          media,
          status: "sent",
          readBy: [sender],
        });

        const populatedMsg = await Message.findById(msg._id)
          .populate("sender", "_id name profileImage languageCode");

        const safeMsg = {
          ...populatedMsg._doc,
          text: populatedMsg.text ? decrypt(populatedMsg.text) : "",
          tempId,
        };

        // 🔥 SEND MESSAGE
        io.to(chatId).emit("receiveMessage", safeMsg);

        // 🔥 DELIVERED (other users only)
        socket.to(chatId).emit("messageStatusUpdate", {
          messageId: msg._id,
          status: "delivered",
        });

      } catch (err) {
        console.log("SEND MESSAGE ERROR:", err);
      }
    });

    /* ---------------- MARK AS READ ---------------- */
    socket.on("markAsRead", async ({ chatId, userId }) => {
      try {
        const messages = await Message.find({
          chatId,
          sender: { $ne: userId },
          readBy: { $ne: userId },
        });

        for (let msg of messages) {
          msg.readBy.push(userId);
          msg.status = "seen"; // ✅ BLUE TICK
          await msg.save();

          // 🔥 UPDATE STATUS
          io.to(chatId).emit("messageStatusUpdate", {
            messageId: msg._id,
            status: "seen",
          });
        }

        // 🔥 UPDATE CHAT LIST (unread count remove)
        io.to(chatId).emit("messagesRead", { chatId });

      } catch (err) {
        console.log("MARK READ ERROR:", err);
      }
    });
    /* ---------------- DELETE MESSAGE ---------------- */
    socket.on("deleteMessage", async ({ messageId, userId }) => {
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { deletedFor: userId },
      });

      io.emit("messageDeleted", { messageId, userId });
    });
  });
};