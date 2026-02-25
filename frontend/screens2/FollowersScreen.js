import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const followers = [
  { id: 1, name: "Suresh" },
  { id: 2, name: "Mahesh" },
  { id: 3, name: "Ravi" },
];

export default function FollowersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Followers</Text>
      <FlatList
        data={followers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  item: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 8,
    elevation: 2,
  },
});