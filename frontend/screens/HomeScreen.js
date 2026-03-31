import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { auth } from "../firebase/firebaseConfig";
import { useUser } from "../context/UserContext";
import PostCard from "../components/PostCard";


const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const userProfile = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("local");

  useEffect(() => {
    if (!userProfile) return;
    fetchPosts();
  }, [viewMode, userProfile]);

  const fetchPosts = async () => {
    try {
      const idToken = await auth.currentUser.getIdToken();

      const res = await axios.post(
        `${API_URL}/api/posts/all`,
        {
          idToken,
          viewMode
        }
      );

      setPosts(res.data);

    } catch (error) {
      console.log("FETCH ERROR:", error);
    }finally {
    setLoading(false);
    setRefreshing(false);
  }
  };

    if (!userProfile) {
      return <Text>Loading...</Text>;
    }

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };



const renderPost = ({ item }) => (
  <PostCard
    post={item}
    viewMode={viewMode}
    userLanguage={userProfile.languageCode}
  />
);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.appName}>Agri Bond 🌾</Text>
        <TouchableOpacity>
          <Feather name="settings" size={22} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchRow}>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.userAvatar}
        />
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#777" />
          <TextInput
            placeholder="Search farmers, crops..."
            style={styles.searchInput}
          />
        </View>
      </View>
      <View style={{ flexDirection: "row", marginLeft:"auto", marginRight:9 }}>
        <TouchableOpacity onPress={() => setViewMode("local")}>
          <Text style={{ marginRight: 15 }}>
            {viewMode === "local" ? "🔘" : "⚪"} My Language
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setViewMode("en")}>
          <Text>
            {viewMode === "en" ? "🔘" : "⚪"} English
          </Text>
        </TouchableOpacity>
      </View>
      {/* POSTS */}
      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    marginTop: 15,
  },

  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2e7d32",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    paddingHorizontal: 10,
    borderRadius: 20,
    height: 40,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
  },

  postCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    margin: 10,
    elevation: 2,
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  name: {
    fontWeight: "bold",
  },

  location: {
    fontSize: 12,
    color: "#777",
  },

  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },

  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});