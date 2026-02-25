import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import PostCard from "../components/PostCard";

const myPosts = [
  { id: 1, content: "Harvest day 🌾" },
  { id: 2, content: "Soil testing success 👍" },
];

export default function PostsListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Posts</Text>
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  post: { padding: 15, backgroundColor: "#f1f8e9", marginBottom: 10 },
});