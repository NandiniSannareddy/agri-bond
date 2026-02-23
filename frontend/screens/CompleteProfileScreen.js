import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';


export default function CompleteProfileScreen() {
    const navigation = useNavigation();

  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [language, setLanguage] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>
        Help us personalize your experience
      </Text>

      {/* Name */}
      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      {/* State */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={state}
          onValueChange={(itemValue) => setState(itemValue)}
        >
          <Picker.Item label="Select State" value="" />
          <Picker.Item label="Andhra Pradesh" value="AP" />
          <Picker.Item label="Telangana" value="TS" />
          <Picker.Item label="Tamil Nadu" value="TN" />
          <Picker.Item label="Karnataka" value="KA" />
        </Picker>
      </View>

      {/* District */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={district}
          onValueChange={(itemValue) => setDistrict(itemValue)}
        >
          <Picker.Item label="Select District" value="" />
          <Picker.Item label="Nellore" value="Nellore" />
          <Picker.Item label="Chittoor" value="Chittoor" />
          <Picker.Item label="Hyderabad" value="Hyderabad" />
        </Picker>
      </View>

      {/* Language */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={language}
          onValueChange={(itemValue) => setLanguage(itemValue)}
        >
          <Picker.Item label="Preferred Language" value="" />
          <Picker.Item label="Telugu" value="Telugu" />
          <Picker.Item label="Hindi" value="Hindi" />
          <Picker.Item label="English" value="English" />
          <Picker.Item label="Tamil" value="Tamil" />
        </Picker>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('MainTabs')}
        >
        <Text style={styles.buttonText}>Save & Continue</Text>
      </TouchableOpacity>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: '#f5efe6',
    justifyContent: 'center'
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 8
  },

  subtitle: {
    textAlign: 'center',
    color: '#6d4c41',
    marginBottom: 30
  },

  input: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2
  },

  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2
  },

  button: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
