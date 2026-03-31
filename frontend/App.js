import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import axios from "axios";

import WelcomeScreen from './screens/WelcomeScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import HomeScreen from './screens/HomeScreen';
import MessagesStack from './navigation/MessagesStack';
import AddPost from "./screens/AddPost";

import { UserProvider, useUser } from "./context/UserContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ---------------------- TABS ---------------------- */

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2e7d32',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home')
            return <AntDesign name="home" size={size} color={color} />;
          if (route.name === 'Post')
            return <AntDesign name="plus" size={size} color={color} />;
          if (route.name === 'Messages')
            return <Feather name="message-circle" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Post" component={AddPost} />
      <Tab.Screen name="Messages" component={MessagesStack} />
    </Tab.Navigator>
  );
}

/* ---------------------- APP CONTENT ---------------------- */
/* This is INSIDE UserProvider so useUser works here */

function AppContent() {

  const [initialRoute, setInitialRoute] = useState(null);
  const { setUserProfile } = useUser();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();

          const res = await axios.post(
            `${API_URL}/api/user/profile`,
            { idToken }
          );

          setUserProfile(res.data);
          setInitialRoute("MainTabs");

        } catch (error) {
          console.log("PROFILE ERROR:", error);
          setInitialRoute("Welcome");
        }

      } else {
        setUserProfile(null);
        setInitialRoute("Welcome");
      }
    });

    return unsubscribe;
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* ---------------------- ROOT APP ---------------------- */
/* ONLY wrapping happens here */

export default function App() {
  return (
    <UserProvider>
      <StatusBar style="dark" />
      <AppContent />
    </UserProvider>
  );
}