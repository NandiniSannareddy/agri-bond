import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Share
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import axios from "axios";
import { auth } from "../firebase/firebaseConfig";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const PostCard = ({ post, viewMode, userLanguage, idToken }) => {

  const [showOriginal, setShowOriginal] = useState(false);
  const [updatedPost, setUpdatedPost] = useState(post);
  const [selectedOption, setSelectedOption] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const currentViewLang =
    viewMode === "en" ? "en" : userLanguage;

  const isDifferentLanguage =
    post.originalLanguage !== currentViewLang;
  

  // ✅ detect already voted
  useEffect(() => {
    if (!updatedPost.poll) return;

    updatedPost.poll.options.forEach((opt, index) => {
      if (opt.votes.includes(updatedPost.author?._id)) {
        setSelectedOption(index);
      }
    });
  }, [updatedPost]);

  // ✅ LIKE
  const handleLike = async () => {
    try {
      setLoading(true);
      const idToken = await auth.currentUser.getIdToken();
      const { data } = await axios.post(`${API_URL}/api/posts/like`, {
        idToken,
        postId: updatedPost._id,
      });

      setUpdatedPost(data);

    } catch (err) {
      console.log("LIKE ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ COMMENT
  const handleComment = async () => {
    if (!comment) return;

    try {
      setLoading(true);

      const { data } = await axios.post(`${API_URL}/api/post/comment`, {
        idToken,
        postId: updatedPost._id,
        text: comment,
      });

      setUpdatedPost(data);
      setComment("");

    } catch (err) {
      console.log("COMMENT ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ POLL
  const handleVote = async (index) => {
  console.log("INDEX:", index); // DEBUG

  if (selectedOption !== null) return;

  try {
    const idToken = await auth.currentUser.getIdToken();
    console.log("DATA SENT:", {
  idToken,
  postId: updatedPost._id,
  optionIndex: index
});
    const { data } = await axios.post(`${API_URL}/api/posts/vote`, {
      idToken,
      postId: updatedPost._id,
      optionIndex: Number(index), // ✅ FORCE NUMBER
    });

    setUpdatedPost(data);
    setSelectedOption(index);

  } catch (err) {
    console.log("POLL ERROR:", err.response?.data || err.message);
  }
};

  // ✅ SHARE
  const handleShare = async () => {
    await Share.share({
      message: updatedPost.textOriginal || "Check this post!",
    });
  };

  return (
    <View style={styles.card}>

      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              updatedPost.author?.profileImage ||
              "https://i.pravatar.cc/100",
          }}
          style={styles.profile}
        />

        <View>
          <Text style={styles.name}>
            {updatedPost.author?.name || "User"}
          </Text>

          <Text style={styles.location}>
            {updatedPost.author?.state}, {updatedPost.author?.district}
          </Text>
        </View>
      </View>

      {/* TEXT */}
      <Text style={styles.content}>
        {showOriginal
          ? updatedPost.textOriginal
          : updatedPost.translatedText || updatedPost.textOriginal}
      </Text>

      {isDifferentLanguage && (
        <TouchableOpacity onPress={() => setShowOriginal(!showOriginal)}>
          <Text style={styles.toggle}>
            {showOriginal ? "Show Translated" : "Show Original"}
          </Text>
        </TouchableOpacity>
      )}

      {/* POLL */}
      {updatedPost.poll && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: "bold" }}>
            {updatedPost.poll.question}
          </Text>

          {updatedPost.poll.options.map((opt, index) => {

            const totalVotes = updatedPost.poll.options.reduce(
              (sum, o) => sum + o.votes.length,
              0
            );

            const percent =
              totalVotes > 0
                ? (opt.votes.length / totalVotes) * 100
                : 0;

            const isSelected = selectedOption === index;

            return (
              <TouchableOpacity
                key={index}
                disabled={loading}
                onPress={() => handleVote(index)}
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderRadius: 8,
                  backgroundColor: isSelected ? "#1976d2" : "#f1f1f1"
                }}
              >
                <Text style={{ color: isSelected ? "white" : "black" }}>
                  {opt.text}
                </Text>

                <Text style={{ color: isSelected ? "white" : "gray" }}>
                  {Math.round(percent)}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* MEDIA */}
      {updatedPost.images?.map((img, i) => (
        <Image key={i} source={{ uri: img }} style={styles.media} />
      ))}

      {updatedPost.video && (
        <Video
          source={{ uri: updatedPost.video }}
          style={styles.media}
          useNativeControls
        />
      )}

      {/* ACTIONS */}
      <View style={styles.actions}>

        <TouchableOpacity
          disabled={loading}
          onPress={handleLike}
          style={styles.actionItem}
        >
          <Ionicons name="heart-outline" size={22} />
          <Text>Like ({updatedPost.likes?.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="chatbubble-outline" size={22} />
          <Text>Comment ({updatedPost.comments?.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.actionItem}>
          <Ionicons name="share-outline" size={22} />
          <Text>Share</Text>
        </TouchableOpacity>

      </View>

      {/* COMMENT INPUT */}
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Write comment... @username"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 8
          }}
        />

        <TouchableOpacity disabled={loading} onPress={handleComment}>
          <Text style={{ marginLeft: 10, color: "#1976d2" }}>
            Post
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    marginBottom: 8,
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontWeight: "bold",
  },
  location: {
    color: "gray",
    fontSize: 12,
  },
  content: {
    marginVertical: 8,
  },
  toggle: {
    color: "#1976d2",
  },
  media: {
    width: "100%",
    height: 200,
    marginTop: 8,
    borderRadius: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
});