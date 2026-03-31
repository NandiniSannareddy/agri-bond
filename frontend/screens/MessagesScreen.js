import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

const chats = [
  {
    id: "1",
    name: "Ramesh",
    lastMessage: "Interested in your tomato harvest 🌾",
    time: "2m",
    unread: 2,
    online: true,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "Suresh",
    lastMessage: "Drip irrigation details please",
    time: "1h",
    unread: 0,
    online: false,
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
];

export default function MessagesScreen({ navigation, route }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate("Chat", { user: item, sharedPost: route?.params?.sharedPost || null,
                sharedImage: route?.params?.sharedImage || null,
                sharedText: route?.params?.sharedText || null, })}
          >
            <View>
              <Image source={{ uri: item.image }} style={styles.avatar} />
              {item.online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.chatContent}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>

              <View style={styles.row}>
                <Text
                  style={[
                    styles.lastMessage,
                    item.unread > 0 && { fontWeight: "bold" },
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>

                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  chatItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
  },

  onlineDot: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "green",
    borderWidth: 2,
    borderColor: "#fff",
  },

  chatContent: {
    flex: 1,
    marginLeft: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
  },

  lastMessage: {
    color: "gray",
    flex: 1,
  },

  time: {
    fontSize: 12,
    color: "gray",
  },

  unreadBadge: {
    backgroundColor: "#0A66C2",
    borderRadius: 10,
    paddingHorizontal: 6,
    marginLeft: 5,
  },

  unreadText: {
    color: "#fff",
    fontSize: 12,
  },
});