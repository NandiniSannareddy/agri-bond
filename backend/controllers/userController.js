import admin from "../config/firebase.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { translateText } from "../utils/translator.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const createUserProfile = async (req, res) => {
  try {
    const { idToken, name, state, district, language, languageCode } = req.body;

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);

    const existingUser = await User.findOne({ firebaseUid: decoded.uid });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      firebaseUid: decoded.uid,
      phone: decoded.phone_number,
      name,
      state,
      district,
      language,
      languageCode,
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkUser = async (req, res) => {
  const { idToken } = req.body;

  const decoded = await admin.auth().verifyIdToken(idToken);
  const user = await User.findOne({ firebaseUid: decoded.uid });

  if (user) return res.json({ exists: true, user });

  res.json({ exists: false });
};

// 🔥 GET USER PROFILE + POSTS (TRANSLATED)
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { viewerId } = req.query;

    const user = await User.findById(userId);
    const viewer = await User.findById(viewerId);

    if (!user || !viewer) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 TARGET LANGUAGE (same logic as feed)
    const targetLanguage = viewer.languageCode;

    // 🔥 GET POSTS OF THIS USER
    const posts = await Post.find({ author: userId })
      .populate("author", "name state district profileImage")
      .sort({ createdAt: -1 });

    // 🔥 REAL TRANSLATION (same as getPosts)
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

    // 🔥 RELATION CHECK
    const isConnected = viewer.connections.some(
      (id) => id.toString() === userId
    );
    const isRequested = viewer.sentRequests.some(
      (id) => id.toString() === userId
    );
    const hasRequestedYou = viewer.connectionRequests.some(
      (id) => id.toString() === userId
    );

    res.json({
      user,
      posts: processedPosts,
      isConnected,
      isRequested,
      hasRequestedYou
    });

  } catch (err) {
    console.log("PROFILE ERROR:", err);
    res.status(500).json({ message: "Profile error" });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    const { idToken } = req.body;

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decoded.uid });

    // 🔥 UPLOAD USING BUFFER
    const result = await uploadToCloudinary(
      req.file.buffer,
      "profile_images",
      "image"
    );

    user.profileImage = result.secure_url;

    await user.save();

    res.json({ profileImage: user.profileImage });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, state, district, language, languageCode } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        state,
        district,
        language,
        languageCode,
      },
      { new: true }
    );

    res.json(updatedUser);

  } catch (err) {
    console.log("UPDATE USER ERROR:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;

    const { language, languageCode } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        language,
        languageCode,
      },
      { new: true }
    );

    res.json(updatedUser);

  } catch (err) {
    console.log("UPDATE LANGUAGE ERROR:", err);
    res.status(500).json({ error: "Failed to update language" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // 📝 DELETE POSTS
    await Post.deleteMany({ author: id });

    // 🧑‍🌾 DELETE USER
    await User.findByIdAndDelete(id);

    res.json({ message: "Account deleted successfully" });

  } catch (err) {
    console.log("DELETE ACCOUNT ERROR:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
};