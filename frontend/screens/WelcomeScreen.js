import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require('../assets/farmer.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Dark Overlay for Better Text Visibility */}
        <View style={styles.overlay}>

          <View style={styles.centerContent}>
            <Text style={styles.title}>Agri Bond🌾</Text>

            <Text style={styles.subtitle}>
              Connecting Farmers.
              {"\n"}
              Empowering Agriculture.
            </Text>

            <TouchableOpacity
                style={styles.googleButton}
                onPress={() => navigation.navigate('Profile')}
                >
                <AntDesign name="google" size={20} color="#000" />
                <Text style={styles.googleText}>
                    Continue with Google
                </Text>
            </TouchableOpacity>

          </View>

        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  background: {
    flex: 1,
    justifyContent: 'center'
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)', // adjust darkness here
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30
  },

  centerContent: {
    alignItems: 'center'
  },

  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#f1f1f1',
    marginBottom: 40,
    lineHeight: 22
  },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 25,
    borderRadius: 30
  },

  googleText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600'
  }
});
