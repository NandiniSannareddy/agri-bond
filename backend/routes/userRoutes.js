import express from "express";
import { createUserProfile, checkUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/complete-profile", createUserProfile);
router.post("/check-user", checkUser);

export default router;