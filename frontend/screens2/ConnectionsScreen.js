import React from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";

const connections = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  name: `Farmer ${i + 1}`,
  avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
}));

export default function ConnectionsScreenV2() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connections</Text>

      <FlatList
        data={connections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
  },
});