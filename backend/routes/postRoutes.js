// routes/postRoutes.js

import express from "express";
import {
  createPost,
  getPosts,
  toggleLike,
  addComment,
  repost,
  votePoll,
    likeComment,
  deleteComment,replyToComment
} from "../controllers/postController.js";
import upload from "../config/multer.js";

const router = express.Router();
router.post("/create", (req, res, next) => {
  console.log("Route reached");
  next();
}, upload.fields([
  { name: "images", maxCount: 5 },
  { name: "video", maxCount: 1 },
]), createPost);
router.post("/all", getPosts);
router.post("/like", toggleLike);
router.post("/comment", addComment);
router.post("/comment/like", likeComment);
router.post("/comment/delete", deleteComment);
router.post("/comment/reply", replyToComment);
router.post("/repost", repost);
router.post("/vote", votePoll);

export default router;