import admin from "../config/firebase.js";

export const verifyPhoneOTP = async (req, res) => {
  try {
    const { idToken } = req.body;

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    res.status(200).json({
      success: true,
      uid: decodedToken.uid,
      phone: decodedToken.phone_number,
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};