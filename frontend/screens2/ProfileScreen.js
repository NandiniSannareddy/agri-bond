// ProfileScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import PostCard from "../components/PostCard";

const userData = {
  name: "Ramesh Kumar",
  role: "Farmer",
  location: "Guntur, Andhra Pradesh",
  avatar: "https://i.pravatar.cc/150?img=3",
  posts: 2,
  connections: 128,
  followers: 342,
  bio: "Passionate farmer 🌾 | Sustainable agriculture | Learning every day",
};

const myPosts = [
  {
    id: 1,
    name: "Ramesh",
    location: "Guntur, Andhra Pradesh",
    profileImage: userData.avatar,
    content: "Harvest day 🌾 Feeling proud!",
    image:
      "https://images.unsplash.com/photo-1592928300924-0d8bfc2c5b4e",
    likes: 24,
    comments: 6,
  },
  {
    id: 2,
    name: "Ramesh",
    location: "Guntur, Andhra Pradesh",
    profileImage: userData.avatar,
    content: "Soil testing helps improve yield 👍",
    likes: 18,
    comments: 3,
  },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [bio, setBio] = useState(userData.bio);
  const [editingBio, setEditingBio] = useState(false);

  const Stat = ({ label, value, onPress }) => (
    <TouchableOpacity style={styles.stat} onPress={onPress}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Image source={{ uri: userData.avatar }} style={styles.avatar} />

          {/* Change Profile (UI only) */}
          <TouchableOpacity style={styles.cameraIcon}>
            <Feather name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.role}>{userData.role}</Text>
        <Text style={styles.location}>{userData.location}</Text>

        {/* BIO */}
        <View style={styles.bioBox}>
          {editingBio ? (
            <>
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                style={styles.bioInput}
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => setEditingBio(false)}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.bioText}>{bio}</Text>
              <TouchableOpacity onPress={() => setEditingBio(true)}>
                <Text style={styles.editBio}>Edit Bio</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <Stat
          label="Posts"
          value={userData.posts}
          onPress={() => navigation.navigate("Posts")}
        />
        <Stat
          label="Connections"
          value={userData.connections}
          onPress={() => navigation.navigate("Connections")}
        />
        <Stat
          label="Followers"
          value={userData.followers}
          onPress={() => navigation.navigate("Followers")}
        />
      </View>

      {/* POSTS */}
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostCard post={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f1f8e9",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#2e7d32",
    padding: 6,
    borderRadius: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  role: {
    color: "#2e7d32",
    marginTop: 4,
  },
  location: {
    color: "#666",
    marginTop: 2,
  },
  bioBox: {
    marginTop: 12,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bioText: {
    textAlign: "center",
    color: "#444",
  },
  editBio: {
    marginTop: 6,
    color: "#2e7d32",
    fontWeight: "bold",
  },
  bioInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#666",
    marginTop: 2,
  },
});