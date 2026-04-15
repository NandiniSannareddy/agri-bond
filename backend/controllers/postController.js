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
          currentUserId: user._id.toString() // ✅ ADD THIS LINE
        };
      })
    );
    res.json(processedPosts);

  } catch (error) {
    console.log("GET POSTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

/* export const toggleLike = async (req, res) => {
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
 */

export const toggleLike = async (req, res) => {
  try {
    const { idToken, postId } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = user._id.toString(); // ✅ IMPORTANT CHANGE

    const alreadyLiked = post.likes.some(
      id => id.toString() === userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        id => id.toString() !== userId
      );
    } else {
      post.likes.push(user._id); // ✅ IMPORTANT CHANGE
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author")
      .populate("comments.user");

    res.json({
  ...updatedPost._doc,
  currentUserId: user._id.toString() // ✅ ADD THIS LINE
});

  } catch (error) {
    console.log("LIKE BACKEND ERROR:", error);
    res.status(500).json({
      message: "Like failed",
      error: error.message
    });
  }
};
/* export const addComment = async (req, res) => {
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
}; */

export const addComment = async (req, res) => {
  try {
    const { idToken, postId, text } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decoded.uid });

    const post = await Post.findById(postId);

    // ✅ FIX 1: check post BEFORE using
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

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
      .populate("comments.user")
      .populate("comments.replies.user");

    // ✅ FIX 2: send currentUserId
    res.json({
      ...updatedPost._doc,
      currentUserId: user._id.toString()
    });

  } catch (error) {
    console.log("COMMENT BACKEND ERROR:", error);
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
export const deletePost = async (req, res) => {
  try {
    const { idToken, postId } = req.body;

    // ✅ VERIFY FIREBASE USER
    const decoded = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decoded.uid;

    // ✅ FIND USER IN DB
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ✅ CHECK OWNER (FIXED)
    if (post.author.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Post.findByIdAndDelete(postId);

    res.json({ message: "Post deleted successfully" });

  } catch (err) {
    console.log("DELETE POST ERROR:", err);
    res.status(500).json({ message: "Server error" });
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

   /* if (!post.poll.options[optionIndex]) {
      return res.status(400).json({ message: "Invalid option index" });
    }*/
    // ✅ check already voted (FIXED)
   let previousOptionIndex = -1;

    // 🔍 Find previous vote
    post.poll.options.forEach((option, index) => {
      if (option.votes.some(v => String(v) === String(user._id))) {
        previousOptionIndex = index;
      }
    });

    // ✅ UNDO (same option clicked)
  /*  if (previousOptionIndex === optionIndex) {
      post.poll.options[optionIndex].votes =
        post.poll.options[optionIndex].votes.filter(
          v => String(v) !== String(user._id)
        );
    }


    // ✅ CHANGE vote
    else if (previousOptionIndex !== -1) {
      // remove old vote
      post.poll.options[previousOptionIndex].votes =
        post.poll.options[previousOptionIndex].votes.filter(
          v => String(v) !== String(user._id)
        );

      // add new vote
      post.poll.options[optionIndex].votes.push(user._id);
    }

    // ✅ FIRST TIME vote
    else {
      post.poll.options[optionIndex].votes.push(user._id);
    }*/
   // 🔥 HANDLE UNDO
if (optionIndex === null) {
  if (previousOptionIndex !== -1) {
    post.poll.options[previousOptionIndex].votes =
      post.poll.options[previousOptionIndex].votes.filter(
        v => String(v) !== String(user._id)
      );
  }
}

// 🔥 CHANGE vote
else if (previousOptionIndex !== -1) {
  post.poll.options[previousOptionIndex].votes =
    post.poll.options[previousOptionIndex].votes.filter(
      v => String(v) !== String(user._id)
    );

  post.poll.options[optionIndex].votes.push(user._id);
}

// 🔥 FIRST TIME vote
else {
  post.poll.options[optionIndex].votes.push(user._id);
}

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author")
      .populate("comments.user");

   // res.json(updatedPost);
res.json({
  ...updatedPost._doc,
  currentUserId: user._id.toString()
});

  } catch (error) {
    console.log("POLL ERROR:", error); // 🔥 VERY IMPORTANT
    res.status(500).json({
      message: "Poll vote failed",
      error: error.message,
    });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { idToken, postId, commentId } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = user._id.toString();

    const alreadyLiked = (comment.likes || []).some(
      id => id.toString() === userId
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        id => id.toString() !== userId
      );
    } else {
      comment.likes.push(user._id);
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author")
      .populate("comments.user")
      .populate("comments.replies.user");

    res.json({
      ...updatedPost._doc,
      currentUserId: userId
    });

  } catch (err) {
    console.log("LIKE COMMENT ERROR:", err);
    res.status(500).json({ message: "Comment like failed" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { idToken, postId, commentId } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    
    

    if (comment.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }
    console.log("DELETING COMMENT:", commentId);

    post.comments = post.comments.filter(
  c => c._id.toString() !== commentId
);
console.log("COMMENTS AFTER DELETE:", post.comments);

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author")
      .populate("comments.user")
      .populate("comments.replies.user");

    res.json({
      ...updatedPost._doc,
      currentUserId: user._id.toString()
    });

  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
export const replyToComment = async (req, res) => {
  try {
    const { idToken, postId, commentId, text } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({
      user: user._id,
      text
    });

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author")
      .populate("comments.user")
      .populate("comments.replies.user");

    res.json({
      ...updatedPost._doc,
      currentUserId: user._id.toString()
    });

  } catch (err) {
    res.status(500).json({ message: "Reply failed" });
  }
};