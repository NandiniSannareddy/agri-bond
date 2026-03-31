import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    language: {
      type: String, // Telugu
      required: true,
    },
    languageCode: {
      type: String, // te
      required: true,
    },
    profileImage: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);