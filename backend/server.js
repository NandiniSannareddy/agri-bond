import "./config/env.js";
import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import networkRoutes from "./routes/networkRoutes.js";
import translateRoutes from "./routes/translateRoutes.js";

// 👉 NEW (socket handler)
import { chatSocket } from "./sockets/chatSocket.js";

const app = express();

// ✅ middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ DB
connectDB();

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/network", networkRoutes);
app.use("/api/translate", translateRoutes);

// ================= SOCKET.IO SETUP =================

// 🔥 create HTTP server (IMPORTANT)
const server = http.createServer(app);

// 🔥 attach socket
const io = new Server(server, {
  cors: {
    origin: "*", // change later for security
  },
});
app.set("io", io); // make io accessible in routes via req.app.get("io")
// 🔥 initialize socket logic
chatSocket(io);

// ================= START SERVER =================

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log("🚀 Server + Socket running on port", port);
});