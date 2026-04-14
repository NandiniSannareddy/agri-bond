import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: String,
  media: String, // image/video URL
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId }],
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent"
  },
  readBy: [
  {
    type: String, // userId
  },
],
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);