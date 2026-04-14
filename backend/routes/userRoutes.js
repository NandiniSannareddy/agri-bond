import express from "express";
import { createUserProfile, checkUser, getProfile, uploadProfileImage, updateUser, updateLanguage, deleteAccount } from "../controllers/userController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/complete-profile", createUserProfile);
router.post("/check-user", checkUser);
router.get("/profile/:userId", getProfile);
router.post(
  "/upload-profile",
  upload.single("image"),
  uploadProfileImage
);
router.put("/update/:id", updateUser);
router.put("/update-language/:id", updateLanguage);
router.delete("/delete-account/:id", deleteAccount);

export default router;