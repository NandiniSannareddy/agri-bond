import express from "express";
import { verifyPhoneOTP } from "../controllers/authController.js";

const router = express.Router();

router.post("/verify-phone", verifyPhoneOTP);

export default router;