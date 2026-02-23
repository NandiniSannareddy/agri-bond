import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, Feather } from '@expo/vector-icons';

import WelcomeScreen from './screens/WelcomeScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import HomeScreen from './screens/HomeScreen';

import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function CreatePostScreen() {
  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <Text>Create Post Screen</Text>
    </View>
  );
}

function MessagesScreen() {
  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <Text>Messages Screen</Text>
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
          } else if (route.name === 'Post') {
            return <AntDesign name="plus" size={size} color={color} />;
          } else if (route.name === 'Messages') {
            return <Feather name="message-circle" size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Post" component={CreatePostScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
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
        <Stack.Screen name="Profile" component={CompleteProfileScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
    </>
  );
}
