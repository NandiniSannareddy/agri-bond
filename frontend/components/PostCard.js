import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.card}>
      
      {/* 🔹 Profile + Name + Location */}
      <View style={styles.header}>
        <Image source={{ uri: post.profileImage }} style={styles.profile} />
        <View>
          <Text style={styles.name}>{post.name}</Text>
          <Text style={styles.location}>{post.location}</Text>
        </View>
      </View>

      {/* 🔹 Post Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* 🔹 Image */}
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postMedia} />
      )}

      {/* 🔹 Video */}
      {post.video && (
        <Video
          source={{ uri: post.video }}
          style={styles.postMedia}
          useNativeControls
          resizeMode="contain"
        />
      )}

      {/* 🔹 Like & Comment Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => setLiked(!liked)}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? 'red' : 'gray'}
          />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color="gray"
          />
        </TouchableOpacity>
      </View>

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
    marginTop: 8,
  },
});
