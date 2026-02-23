import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import PostCard from '../components/PostCard';
import { StatusBar } from 'expo-status-bar';

const posts = [
  {
    id: 1,
    name: 'Ramesh',
    location: 'Guntur, Andhra Pradesh',
    profileImage: 'https://i.pravatar.cc/150?img=1',
    content: 'Today harvested fresh tomatoes 🍅',
    image: 'https://images.unsplash.com/photo-1592928300924-0d8bfc2c5b4e',
    likes: 12,
    comments: 4,
  },
  {
    id: 2,
    name: 'Suresh',
    location: 'Warangal, Telangana',
    profileImage: 'https://i.pravatar.cc/150?img=2',
    content: 'Drip irrigation working well this season',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    likes: 12,
    comments: 4,
  },
];


export default function HomeScreen() {

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/100' }}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.location}>Farmer</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
        <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.appName}>Agri Bond🌾</Text>

        <TouchableOpacity>
          <Feather name="settings" size={22} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      {/* PROFILE + SEARCH BAR */}
      <View style={styles.searchRow}>

        {/* Profile Avatar */}
        <TouchableOpacity>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.userAvatar}
          />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#777" />
          <TextInput
            placeholder="Search farmers, crops..."
            style={styles.searchInput}
          />
        </View>

      </View>

      {/* POSTS */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostCard post={item} />}
       />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop:9,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    elevation: 3,
    marginTop:15
  },

  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32'
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#ffffff'
  },

  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 10,
    borderRadius: 20,
    height: 40
  },

  searchInput: {
    flex: 1,
    marginLeft: 8
  },

  postCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },

  name: {
    fontWeight: 'bold'
  },

  location: {
    fontSize: 12,
    color: '#777'
  },

  postContent: {
    fontSize: 14,
    lineHeight: 20
  }
});
