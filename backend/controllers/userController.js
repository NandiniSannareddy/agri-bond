import admin from "../config/firebase.js";
import User from "../models/User.js";

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