// FULL ADVANCED CHATSCREEN (EXPO GO ANDROID FIXED + SEPARATE CHAT PER USER)

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

const { height } = Dimensions.get("window");

export default function ChatScreen({ route }) {
  const { user } = route.params || {};

  const flatListRef = useRef();
  const slideAnim = useRef(new Animated.Value(height)).current;

  const [message, setMessage] = useState("");
  const [allChats, setAllChats] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [showAttachment, setShowAttachment] = useState(false);

  const messages = allChats[user?.id] || [];

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showAttachment ? 0 : height,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showAttachment]);
  /* ---------------- RECEIVE SHARED POST ---------------- */

/*useEffect(() => {
  if (route?.params?.sharedPost && user?.id) {
    const shared = route.params.sharedPost;

    const newMsg = {
      id: Date.now().toString(),
      type: "post", // 🔥 NEW TYPE
      postData: shared,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      deletedForMe: false,
    };

    setAllChats((prev) => ({
      ...prev,
      [user.id]: [...(prev[user.id] || []), newMsg],
    }));
  }
}, [route?.params?.sharedPost]);*/
/* ---------------- RECEIVE SHARED IMAGE + TEXT ---------------- */
 /* useEffect(() => {
    if ((route?.params?.sharedImage || route?.params?.sharedText) && user?.id) {

      const newMsg = {
        id: Date.now().toString(),
        text: route.params.sharedText || "",
        image: route.params.sharedImage || null,
        sender: "me",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        deletedForMe: false,
      };

      setAllChats((prev) => ({
        ...prev,
        [user.id]: [...(prev[user.id] || []), newMsg],
      }));
    }
  }, [route?.params?.sharedImage]);*/
   /* ---------------- RECEIVE ALL SHARED DATA (FIXED) ---------------- */

  useEffect(() => {
    if (!user?.id) return;

    const { sharedPost, sharedImage, sharedText } = route?.params || {};

    if (!sharedPost && !sharedImage && !sharedText) return;

    let newMsg;

    if (sharedPost) {
      newMsg = {
        id: Date.now().toString(),
        type: "post",
        postData: sharedPost,
        sender: "me",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        deletedForMe: false,
      };
    } else {
      newMsg = {
        id: Date.now().toString(),
        text: sharedText || "",
        image: sharedImage || null,
        sender: "me",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        deletedForMe: false,
      };
    }

    setAllChats((prev) => ({
      ...prev,
      [user.id]: [...(prev[user.id] || []), newMsg],
    }));

  }, [route?.params]);
  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      text: message,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      replyTo,
      deletedForMe: false,
    };

    setAllChats((prev) => ({
      ...prev,
      [user.id]: [...(prev[user.id] || []), newMsg],
    }));

    setMessage("");
    setReplyTo(null);
  };

  /* ---------------- ATTACHMENTS ---------------- */

  const openCamera = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    const result = await ImagePicker.launchCameraAsync({});
    if (!result.canceled) {
      sendAttachment("📷 Photo Captured");
    }
    setShowAttachment(false);
  };

  const openGallery = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    const result = await ImagePicker.launchImageLibraryAsync({});
    if (!result.canceled) {
      sendAttachment("🖼 Image Selected");
    }
    setShowAttachment(false);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      sendAttachment("📄 " + result.assets[0].name);
    }
    setShowAttachment(false);
  };

  const sendAttachment = (text) => {
    const newMsg = {
      id: Date.now().toString(),
      text,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      deletedForMe: false,
    };

    setAllChats((prev) => ({
      ...prev,
      [user.id]: [...(prev[user.id] || []), newMsg],
    }));
  };

  const deleteMessage = (id) => {
    setAllChats((prev) => ({
      ...prev,
      [user.id]: prev[user.id].map((msg) =>
        msg.id === id ? { ...msg, deletedForMe: true } : msg
      ),
    }));
  };

  const renderItem = ({ item }) => {
    if (item.deletedForMe) return null;

    return (
      <TouchableOpacity
        onLongPress={() =>
          Alert.alert("Options", "", [
            { text: "Reply", onPress: () => setReplyTo(item) },
            { text: "Copy", onPress: () => Clipboard.setStringAsync(item.text) },
            { text: "Delete", onPress: () => deleteMessage(item.id) },
            { text: "Cancel", style: "cancel" },
          ])
        }
        style={[
          styles.message,
          item.sender === "me" ? styles.myMsg : styles.otherMsg,
        ]}
      >
        {item.type === "post" ? (
          <View style={{ backgroundColor: "#f3f2ef", padding: 10, borderRadius: 10 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
              {item.postData.name}
            </Text>

            <Text style={{ marginBottom: 6 }}>
              {item.postData.content}
            </Text>

            {item.postData.image && (
              <Image
                source={{ uri: item.postData.image }}
                style={{ height: 150, borderRadius: 10 }}
              />
            )}
          </View>
        ) : (
          <>
        {item.replyTo && (
          <View style={styles.replyBox}>
            <Text style={{ fontSize: 12 }}>
              Replying to: {item.replyTo.text}
            </Text>
          </View>
        )}

        <Text style={{ color: item.sender === "me" ? "#fff" : "#000" }}>
          {item.text}
        </Text>
        </>
        )}
        <Text
          style={[
            styles.timeText,
            { color: item.sender === "me" ? "#ddd" : "#555" },
          ]}
        >
          {item.time}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.select({
          ios: 90,
          android: 80,
        })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
              keyboardShouldPersistTaps="handled"
            />

            {replyTo && (
              <View style={styles.replyPreview}>
                <Text>Replying to: {replyTo.text}</Text>
              </View>
            )}

            {/* INPUT AREA */}
            <View style={styles.inputWrapper}>
              <TouchableOpacity onPress={() => setShowAttachment(true)}>
                <MaterialIcons name="attach-file" size={30} color="#0A66C2" />
              </TouchableOpacity>

              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Message..."
                style={styles.input}
                multiline
              />

              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendMessage}
              >
                <MaterialIcons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* ATTACHMENT SHEET (UNCHANGED) */}
            {showAttachment && (
              <>
                <TouchableWithoutFeedback
                  onPress={() => setShowAttachment(false)}
                >
                  <View style={styles.overlay} />
                </TouchableWithoutFeedback>

                <Animated.View
                  style={[
                    styles.bottomSheet,
                    { transform: [{ translateY: slideAnim }] },
                  ]}
                >
                  <TouchableOpacity onPress={pickDocument} style={styles.sheetItem}>
                    <Text style={styles.sheetText}>📄 Send Document</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={openCamera} style={styles.sheetItem}>
                    <Text style={styles.sheetText}>📷 Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={openGallery} style={styles.sheetItem}>
                    <Text style={styles.sheetText}>🖼 Choose From Gallery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setShowAttachment(false)}
                  >
                    <Text style={{ fontWeight: "bold" }}>Cancel</Text>
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  message: {
    padding: 14,
    marginVertical: 6,
    borderRadius: 18,
    maxWidth: "75%",
  },
  myMsg: { backgroundColor: "#0A66C2", alignSelf: "flex-end" },
  otherMsg: { backgroundColor: "#e4e6eb", alignSelf: "flex-start" },

  timeText: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },

  input: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 14,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0A66C2",
    justifyContent: "center",
    alignItems: "center",
  },

  replyBox: {
    backgroundColor: "#ddd",
    padding: 6,
    borderRadius: 6,
    marginBottom: 6,
  },

  replyPreview: {
    padding: 8,
    backgroundColor: "#eee",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 25,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  sheetItem: {
    paddingVertical: 18,
  },

  sheetText: {
    fontSize: 18,
  },

  cancelBtn: {
    marginTop: 15,
    padding: 18,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    alignItems: "center",
  },
});