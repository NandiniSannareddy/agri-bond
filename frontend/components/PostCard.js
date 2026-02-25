import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';

const PostCard = ({ post, onRepost }) => {
  const navigation = useNavigation();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(post.comments || 0);

  const [menuVisible, setMenuVisible] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [comments, setComments] = useState([]);

  const [saved, setSaved] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [following, setFollowing] = useState(true);
  const [showUndo, setShowUndo] = useState(false);

  const handleShare = () => {
    Alert.alert("Share Post","Choose an option",[
      {
        text: "Share via Device",
       onPress: async () => {
  try {

    // Create post link
    const postLink = `https://agribond.app/post/${post.id}`;

    await Share.share({
      message: `Check this post on AgriBond 👇\n${postLink}`,
      url: postLink, // important for iOS
    });

  } catch (error) {
    console.log("Share error:", error);
  }
},
      },
      {
        text: "Share to Agribond Users",
        onPress: () => {
          navigation.navigate("MainTabs", {
            screen: "Messages",
            params: {
              screen: "ChatList",
              params: { sharedPost: post,
                sharedImage: post.image || null,   // ✅ ADDED
                sharedText: post.content || "",    // ✅ ADDED
               },
            },
          });
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = () => {
    setSaved(!saved);
    Alert.alert(saved ? "Removed from Saved" : "Post Saved");
    setMenuVisible(false);
  };

  const handleNotInterested = () => {
    setHidden(true);
    setShowUndo(true);
    setMenuVisible(false);
    setTimeout(() => setShowUndo(false), 5000);
  };

  const handleUndo = () => {
    setHidden(false);
    setShowUndo(false);
  };

  const handleFollowToggle = () => {
    if (following) {
      setFollowing(false);
      Alert.alert(`Unfollowed ${post.name}`);
    } else {
      setFollowing(true);
      Alert.alert(`Followed ${post.name}`);
    }
    setMenuVisible(false);
  };

  const handleReport = () => {
    Alert.alert("Reported", "Post reported successfully.");
    setMenuVisible(false);
  };

  // 🔥 COMMENT LIKE
  const toggleCommentLike = (commentId) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked
                ? comment.likes - 1
                : comment.likes + 1
            }
          : comment
      )
    );
  };

  // 🔥 ADD REPLY
  const submitReply = (commentId) => {
  if (!replyText.trim()) return;

  setComments(prev =>
    prev.map(comment =>
      comment.id === commentId
        ? {
            ...comment,
            replies: [
              {
                id: Date.now().toString(),
                name: "You",
                text: replyText,
                profile: post.profileImage,
                time: "Just now"
              },
              ...(comment.replies || [])
            ]
          }
        : comment
    )
  );

  setReplyText('');
  setReplyingTo(null);
};

  return (
    <View style={[styles.card, hidden && !showUndo && { height: 0, padding: 0, marginBottom: 0 }]}>

      <View style={styles.header}>
        <Image source={{ uri: post.profileImage }} style={styles.profile} />
        <View>
          <Text style={styles.name}>{post.name}</Text>
          <Text style={styles.location}>{post.location}</Text>
        </View>
        <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-horizontal" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.image && <Image source={{ uri: post.image }} style={styles.postMedia} />}
      {post.video && <Video source={{ uri: post.video }} style={styles.postMedia} useNativeControls resizeMode="contain" />}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionItem}
          onPress={() => {
            setLiked(!liked);
            setLikeCount(liked ? likeCount - 1 : likeCount + 1);
          }}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? 'red' : 'gray'} />
          <Text style={styles.actionText}>Like ({likeCount})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}
          onPress={() => setCommentVisible(true)}>
          <Ionicons name="chatbubble-outline" size={22} color="gray" />
          <Text style={styles.actionText}>Comment ({commentCount})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}
         onPress={() => {
  Alert.alert(
    "Repost",
    "Do you want to repost this?",
    [
      {
        text: "Yes",
        onPress: () => onRepost(post)
      },
      { text: "Cancel", style: "cancel" }
    ]
  );
}} >
          <Ionicons name="repeat-outline" size={22} color="gray" />
          <Text style={styles.actionText}>Repost</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={22} color="gray" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
      {showUndo && (
  <View style={styles.undoBar}>
    <Text style={styles.undoText}>Post hidden</Text>
    <TouchableOpacity onPress={handleUndo}>
      <Text style={styles.undoButton}>UNDO</Text>
    </TouchableOpacity>
  </View>
)}
      {/* ================= 3 DOTS MENU ================= */}
<Modal visible={menuVisible} transparent animationType="slide">
  <TouchableOpacity
    style={styles.modalOverlay}
    activeOpacity={1}
    onPressOut={() => setMenuVisible(false)}
  >
    <View style={styles.bottomSheet}>
      <View style={styles.dragIndicator} />

      <TouchableOpacity style={styles.sheetRow} onPress={handleSave}>
        <Ionicons
          name={saved ? "bookmark" : "bookmark-outline"}
          size={22}
          color="black"
        />
        <Text style={styles.sheetText}>
          {saved ? "Saved" : "Save"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sheetRow} onPress={handleShare}>
        <Ionicons name="share-social-outline" size={22} color="black" />
        <Text style={styles.sheetText}>Share via</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sheetRow} onPress={handleNotInterested}>
        <Ionicons name="eye-off-outline" size={22} color="black" />
        <Text style={styles.sheetText}>Not interested</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sheetRow} onPress={handleFollowToggle}>
        <Ionicons
          name={following ? "close-circle-outline" : "person-add-outline"}
          size={22}
          color="black"
        />
        <Text style={styles.sheetText}>
          {following ? `Unfollow ${post.name}` : `Follow ${post.name}`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sheetRow} onPress={handleReport}>
        <Ionicons name="flag-outline" size={22} color="black" />
        <Text style={styles.sheetText}>Report post</Text>
      </TouchableOpacity>

    </View>
  </TouchableOpacity>
</Modal>
      {/* COMMENT MODAL */}
      <Modal visible={commentVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.fullCommentSheet}>

            <View style={styles.commentHeader}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Most relevant</Text>
              <TouchableOpacity onPress={() => setCommentVisible(false)}>
                <Ionicons name="close" size={22} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 90 }}
              renderItem={({ item }) => (
                <View style={styles.modalCommentRow}>
                  <Image source={{ uri: item.profile }} style={styles.commentProfile} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.modalCommentBubble}>
                      <Text style={styles.commentName}>{item.name}</Text>
                      <Text style={styles.commentContent}>{item.text}</Text>
                    </View>

                    <View style={styles.modalCommentActions}>
                      <TouchableOpacity onPress={() => toggleCommentLike(item.id)}>
                        <Text style={[
                          styles.modalActionText,
                          item.liked && { color: '#0073b1', fontWeight: 'bold' }
                        ]}>
                          Like ({item.likes || 0})
                        </Text>
                      </TouchableOpacity>

                     <TouchableOpacity onPress={() => setReplyingTo(item.id)}>
                        <Text style={styles.modalActionText}>Reply</Text>
                    </TouchableOpacity>

                      <Text style={styles.commentTime}>{item.time}</Text>
                    </View>
                    {replyingTo === item.id && (
                      <View style={{ marginTop: 8, marginLeft: 40 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                             <TextInput
                                style={[styles.modalInput, { flex: 1 }]}
                                placeholder="Write a reply..."
                                value={replyText}
                                 onChangeText={setReplyText}
                          />
                          <TouchableOpacity onPress={() => submitReply(item.id)}>
                             <Text style={styles.postButton}>Post</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    {item.replies && item.replies.map(reply => (
                      <View key={reply.id} style={{ marginLeft: 40, marginTop: 8 }}>
                        <View style={styles.modalCommentRow}>
                          <Image source={{ uri: reply.profile }} style={styles.commentProfile} />
                          <View style={styles.modalCommentBubble}>
                            <Text style={styles.commentName}>{reply.name}</Text>
                            <Text style={styles.commentContent}>{reply.text}</Text>
                            <Text style={styles.commentTime}>{reply.time}</Text>
                          </View>
                        </View>
                      </View>
                    ))}

                  </View>
                </View>
              )}
            />

            <View style={styles.modalInputContainer}>
              <Image source={{ uri: post.profileImage }} style={styles.commentProfile} />
              <TextInput
                style={styles.modalInput}
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                onPress={() => {
                  if (!commentText.trim()) return;

                  const newComment = {
                    id: Date.now().toString(),
                    name: "You",
                    text: commentText,
                    profile: post.profileImage,
                    time: "Just now",
                    likes: 0,
                    liked: false,
                    replies: []
                  };

                  setComments([newComment, ...comments]);
                  setCommentCount(commentCount + 1);
                  setCommentText('');
                }}>
                <Text style={styles.postButton}>Comment</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    
    </View>
  );
};

export default PostCard;
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  location: {
    color: 'gray',
    fontSize: 12,
  },

  content: {
    marginVertical: 8,
    fontSize: 14,
  },

  postMedia: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 8,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    borderTopWidth: 0.5,
    borderColor: '#ddd',
    paddingTop: 8,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionText: {
    marginLeft: 4,
    fontSize: 13,
    color: 'gray',
  },

  /* ================= MODAL OVERLAY ================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },

  /* ================= COMMENT MODAL ================= */

  fullCommentSheet: {
    backgroundColor: '#fff',
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },

  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center',
  },

  modalCommentRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  commentProfile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },

  modalCommentBubble: {
    backgroundColor: '#f3f2ef',
    padding: 10,
    borderRadius: 12,
    flex: 1,
  },

  commentName: {
    fontWeight: 'bold',
    fontSize: 14,
  },

  commentContent: {
    fontSize: 14,
    marginTop: 2,
  },

  commentTime: {
    fontSize: 11,
    color: 'gray',
    marginTop: 4,
  },

  modalCommentActions: {
    flexDirection: 'row',
    marginTop: 6,
    alignItems: 'center',
  },

  modalActionText: {
    fontSize: 12,
    color: 'gray',
    marginRight: 15,
  },

  /* ================= INPUT BAR ================= */

  modalInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 0.5,
    borderColor: '#ddd',
  },

  modalInput: {
    flex: 1,
    backgroundColor: '#f3f2ef',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
  },

  postButton: {
    color: '#0073b1',
    fontWeight: 'bold',
  },

  /* ================= UNDO BAR ================= */

  undoBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: '#323232',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 5,
    zIndex: 10,
  },

  undoText: {
    color: 'white',
  },

  undoButton: {
    color: '#4da6ff',
    fontWeight: 'bold',
  },

  /* ================= BOTTOM SHEET ================= */

  bottomSheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 15,
  },

  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  sheetText: {
    fontSize: 16,
    marginLeft: 15,
    color: 'black',
  },
});