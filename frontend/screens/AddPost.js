import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import axios from "axios";
import { auth } from "../firebase/firebaseConfig";
import { useUser } from "../context/UserContext";
import { useNavigation } from "@react-navigation/native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function AddPost() {
  const navigation = useNavigation();
  const { userProfile } = useUser();

  const [postText, setPostText] = useState("");
  const [mediaList, setMediaList] = useState([]);
  const [emojiModal, setEmojiModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [inputMode, setInputMode] = useState("local");
  const [isPoll, setIsPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const emojis = ["😀","😂","😍","🔥","🥳","😎","❤️","👍","🎉","😢"];

  /* ---------------- IMAGE PICKER ---------------- */

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMediaList([...mediaList, ...result.assets]);
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled) {
      setMediaList([...mediaList, result.assets[0]]);
    }
  };

  const removeMedia = (index) => {
    const updated = [...mediaList];
    updated.splice(index, 1);
    setMediaList(updated);
  };

  const cancelPoll = () => {
    setIsPoll(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
  };

  const handlePost = async () => {
    try {
      if (!postText && mediaList.length === 0) {
        return alert("Post cannot be empty");
      }

      const idToken = await auth.currentUser.getIdToken();
      const formData = new FormData();

      formData.append("idToken", idToken);
      formData.append("textOriginal", postText);
      formData.append(
        "originalLanguage",
        inputMode === "en" ? "en" : userProfile?.languageCode
      );

      mediaList.forEach((item, index) => {
        const uri =
          Platform.OS === "ios"
            ? item.uri.replace("file://", "")
            : item.uri;

        const file = {
          uri,
          type: item.type === "video" ? "video/mp4" : "image/jpeg",
          name:
            item.type === "video"
              ? `video-${index}.mp4`
              : `image-${index}.jpg`,
        };

        if (item.type === "image") formData.append("images", file);
        else if (item.type === "video") formData.append("video", file);
      });

      if (isPoll) {
        formData.append(
          "poll",
          JSON.stringify({
            question: pollQuestion,
            options: pollOptions.filter((o) => o.trim() !== ""),
          })
        );
      }

      await axios.post(`${API_URL}/api/posts/create`, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessModal(true);
      setPostText("");
      setMediaList([]);
      cancelPoll();

      setTimeout(() => {
        setSuccessModal(false);
        navigation.goBack();
      }, 1500);

    } catch (error) {
      console.log("POST ERROR:", error);
      alert("Failed to create post");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>

      {/* FIXED HEADER */}
      <View style={styles.header}>
        <Text style={styles.heading}>Create Post</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          enableOnAndroid
          extraScrollHeight={20}
        >

          {/* Language Toggle */}
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <TouchableOpacity onPress={() => setInputMode("local")}>
              <Text style={{ marginRight: 15 }}>
                {inputMode === "local" ? "🔘" : "⚪"} My Language
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setInputMode("en")}>
              <Text>
                {inputMode === "en" ? "🔘" : "⚪"} English
              </Text>
            </TouchableOpacity>
          </View>

          {/* Post Box */}
          <View style={styles.postBox}>
            <TextInput
              style={styles.input}
              placeholder="Write your post..."
              value={postText}
              onChangeText={setPostText}
              multiline
            />

            {/* Media Preview */}
            {mediaList.map((item, index) => (
              <View key={index} style={styles.mediaWrapper}>
                {item.type === "image" ? (
                  <Image source={{ uri: item.uri }} style={styles.preview} />
                ) : (
                  <Video
                    source={{ uri: item.uri }}
                    style={styles.preview}
                    useNativeControls
                  />
                )}

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeMedia(index)}
                >
                  <Ionicons name="close-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Icons */}
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={pickImage}>
                <MaterialIcons name="photo-library" size={26} color="#1976d2" />
              </TouchableOpacity>

              <TouchableOpacity onPress={openCamera}>
                <Ionicons name="camera-outline" size={26} color="#d32f2f" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setEmojiModal(true)}>
                <Ionicons name="happy-outline" size={26} color="#f9a825" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsPoll(true)}>
                <FontAwesome5 name="poll" size={22} color="#8e24aa" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Poll Section */}
          {isPoll && (
            <View style={styles.pollContainer}>
              
              {/* Cancel Poll */}
              <TouchableOpacity
                style={styles.cancelPoll}
                onPress={cancelPoll}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>

              <TextInput
                placeholder="Poll Question"
                value={pollQuestion}
                onChangeText={setPollQuestion}
                style={styles.input}
              />

              {pollOptions.map((opt, index) => (
                <TextInput
                  key={index}
                  placeholder={`Option ${index + 1}`}
                  value={opt}
                  onChangeText={(text) => {
                    const updated = [...pollOptions];
                    updated[index] = text;
                    setPollOptions(updated);
                  }}
                  style={styles.input}
                />
              ))}

              <TouchableOpacity
                onPress={() => setPollOptions([...pollOptions, ""])}
              >
                <Text style={{ color: "#2e7d32" }}>+ Add Option</Text>
              </TouchableOpacity>
            </View>
          )}

        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>

      {/* FIXED POST BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.postButton} onPress={handlePost}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.successContainer}>
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={50} color="#2e7d32" />
            <Text style={{ marginTop: 10, fontWeight: "bold" }}>
              Post Added Successfully!
            </Text>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  header: {
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd"
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold"
  },
  postBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd"
  },
  input: {
    minHeight: 50,
    marginBottom: 10
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginVertical: 5
  },
  mediaWrapper: {
    position: "relative"
  },
  removeBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 20
  },
  pollContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    position: "relative"
  },
  cancelPoll: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "#d32f2f",
    padding: 5,
    borderRadius: 20
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd"
  },
  postButton: {
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 8,
    alignItems: "center"
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold"
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  successBox: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    alignItems: "center"
  }
});