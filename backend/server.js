import express from 'express'
import dotenv from 'dotenv'
import {connectDB} from './config/db.js'
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const app= express();

app.use(cors());
app.use(express.json());
connectDB();

const port= process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.listen(port, ()=>{
  console.log("server running on port", port);
})