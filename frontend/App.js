import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, Feather } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// existing screens
import WelcomeScreen from './screens/WelcomeScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import HomeScreen from './screens/HomeScreen';

// screens2
import ProfileScreen from './screens2/ProfileScreen';
import ConnectionsScreen from './screens2/ConnectionsScreen';
import FollowersScreen from './screens2/FollowersScreen';
import PostsScreen from './screens2/PostsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CreatePostScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Create Post</Text>
    </View>
  );
}

function MessagesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Messages</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2e7d32',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <AntDesign name="home" size={size} color={color} />;
          }
          if (route.name === 'Post') {
            return <AntDesign name="pluscircleo" size={size} color={color} />;
          }
          if (route.name === 'Messages') {
            return <Feather name="message-circle" size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Post" component={CreatePostScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      {/* TEMP: testing */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="ProfileSetup" component={CompleteProfileScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />

          {/* screens2 */}
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Connections" component={ConnectionsScreen} />
          <Stack.Screen name="Followers" component={FollowersScreen} />
          <Stack.Screen name="Posts" component={PostsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}