import express from "express";
import { createUserProfile, checkUser, getProfile, uploadProfileImage } from "../controllers/userController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/complete-profile", createUserProfile);
router.post("/check-user", checkUser);
router.post("/profile", getProfile);
router.post(
  "/upload-profile",
  upload.single("profileImage"),
  uploadProfileImage
);

export default router;