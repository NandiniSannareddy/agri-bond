// models/Post.js

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    textOriginal: {
      type: String,
      required: true,
    },

    originalLanguage: {
      type: String, // "en", "hi", "te"
      required: true,
    },

    images: [
      {
        type: String, // store image URLs
      },
    ],

    video: {
      type: String, // video URL
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    repostedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    shareCount: {
      type: Number,
      default: 0,
    },
  poll: {
    question: {
      type: String,
    },

    options: [
      {
        text: {
          type: String,
        },

        votes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],

    expiresAt: {
      type: Date,
    },
  },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);