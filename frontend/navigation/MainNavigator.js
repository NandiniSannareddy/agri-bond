/*import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
    </Stack.Navigator>
  );
}
*/
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import MessagesStack from './MessagesStack';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* -------- Bottom Tabs -------- */

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Post') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0A66C2',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Post" component={CompleteProfileScreen} />
      <Tab.Screen name="Messages" component={MessagesStack} />
    </Tab.Navigator>
  );
}

/* -------- Main Stack -------- */

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Your original Welcome screen */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      {/* Added MainTabs after Welcome */}
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}