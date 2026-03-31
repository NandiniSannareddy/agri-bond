// controllers/postController.js

import Post from "../models/Post.js";
import User from "../models/User.js";
import admin from "../config/firebase.js";
import { translateText } from "../utils/translator.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";



export const createPost = async (req, res) => {
  try {
    const { idToken, textOriginal, originalLanguage, poll } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Missing idToken" });
    }

    let pollData = null;

    if (poll) {
      const parsedPoll = JSON.parse(poll);

      pollData = {
        question: parsedPoll.question,
        options: parsedPoll.options.map(opt => ({
          text: opt,
          votes: []
        }))
      };
    }
    // 🔐 Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);

    const user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let imageUrls = [];
    let videoUrl = null;

    /* ----------------------------
       Upload Images (if any)
    -----------------------------*/
    if (req.files?.images) {
      for (const file of req.files.images) {
        const result = await uploadToCloudinary(
          file.buffer,
          "agribond/posts/images",
          "image"
        );
        imageUrls.push(result.secure_url);
      }
    }

    /* ----------------------------
       Upload Video (if any)
    -----------------------------*/
    if (req.files?.video) {
      const result = await uploadToCloudinary(
        req.files.video[0].buffer,
        "agribond/posts/videos",
        "video"
      );
      videoUrl = result.secure_url;
    }

    /* ----------------------------
       Save Post in DB
    -----------------------------*/
    const post = await Post.create({
      author: user._id,
      textOriginal,
      originalLanguage,
      images: imageUrls,
      video: videoUrl,
      poll: pollData
    });

    return res.status(201).json(post);

  } catch (error) {
    console.error("CREATE POST ERROR:", error);
    return res.status(500).json({
      message: "Failed to create post",
      error: error.message,
    });
  }
};


export const getPosts = async (req, res) => {
  try {
    const { idToken, viewMode } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);

    const user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // 🔥 Decide target language
    const targetLanguage =
      viewMode === "en" ? "en" : user.languageCode;

    const posts = await Post.find()
      .populate("author", "name images video state district profileImage")
      .sort({ createdAt: -1 });

    const processedPosts = await Promise.all(
      posts.map(async (post) => {
        let translatedText = post.textOriginal;

        if (post.originalLanguage !== targetLanguage) {
          translatedText = await translateText(
            post.textOriginal,
            targetLanguage
          );
        }

        return {
          ...post._doc,
          translatedText: translatedText || post.textOriginal,
        };
      })
    );
    res.json(processedPosts);

  } catch (error) {
    console.log("GET POSTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { idToken, postId } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decoded.uid });

    const post = await Post.findById(postId);

    const alreadyLiked = post.likes.includes(user._id);

    if (alreadyLiked) {
      post.likes.pull(user._id);
    } else {
      post.likes.push(user._id);
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author")
      .populate("comments.user");

    res.json(updatedPost);

  } catch (error) {
    res.status(500).json({ message: "Like failed" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { idToken, postId, text } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decoded.uid });

    const post = await Post.findById(postId);

    // ✅ extract @mentions
    const mentions = text.match(/@\w+/g) || [];

    post.comments.push({
      user: user._id,
      text,
      mentions
    });

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author")
      .populate("comments.user");

    res.json(updatedPost);

  } catch (error) {
    res.status(500).json({ message: "Comment failed" });
  }
};

export const repost = async (req, res) => {
  try {
    const { idToken, postId } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decoded.uid });

    const originalPost = await Post.findById(postId);

    const newPost = await Post.create({
      author: user._id,
      text: originalPost.text,
      images: originalPost.images,
      video: originalPost.video,
      repostedFrom: originalPost._id,
    });

    res.json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Repost failed" });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { idToken, postId, optionIndex } = req.body;

    if (!idToken || !postId || optionIndex === undefined) {
      return res.status(400).json({ message: "Missing data" });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);

    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post || !post.poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (!post.poll.options[optionIndex]) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    // ✅ check already voted (FIXED)
    let alreadyVoted = false;

    post.poll.options.forEach(option => {
      if (
        option.votes.some(
          (v) => v.toString() === user._id.toString()
        )
      ) {
        alreadyVoted = true;
      }
    });

    if (alreadyVoted) {
      const updatedPost = await Post.findById(postId)
        .populate("author")
        .populate("comments.user");

      return res.json(updatedPost);
    }

    // ✅ add vote
    post.poll.options[optionIndex].votes.push(user._id);

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author")
      .populate("comments.user");

    res.json(updatedPost);

  } catch (error) {
    console.log("POLL ERROR:", error); // 🔥 VERY IMPORTANT
    res.status(500).json({
      message: "Poll vote failed",
      error: error.message,
    });
  }
};