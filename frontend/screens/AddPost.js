import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  FlatList,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';

export default function AddPost() {

  const [postText, setPostText] = useState('');
  const [mediaList, setMediaList] = useState([]);

  const [emojiModal, setEmojiModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  // Poll States
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const emojis = ['😀','😂','😍','🔥','🥳','😎','❤️','👍','🎉','😢'];

  // Gallery (multiple)
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMediaList([...mediaList, ...result.assets]);
    }
  };

  // Camera
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled) {
      setMediaList([...mediaList, result.assets[0]]);
    }
  };

  const removeMedia = (index) => {
    const updated = [...mediaList];
    updated.splice(index, 1);
    setMediaList(updated);
  };

  const addEmoji = (emoji) => {
    setPostText(postText + emoji);
    setEmojiModal(false);
  };

  const handlePost = () => {
    setSuccessModal(true);

    setTimeout(() => {
      setSuccessModal(false);
    }, 2000);

    setPostText('');
    setMediaList([]);
    setShowPoll(false);
    setPollQuestion('');
    setOptions(['', '']);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Create Post</Text>

      <View style={styles.postBox}>

        <TextInput
          style={styles.input}
          placeholder="Write your post..."
          value={postText}
          onChangeText={setPostText}
          multiline
        />

        {/* MEDIA PREVIEW */}
        {mediaList.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mediaList.map((item, index) => (
              <View key={index} style={styles.mediaWrapper}>
                
                {item.type === 'image' && (
                  <Image source={{ uri: item.uri }} style={styles.preview} />
                )}

                {item.type === 'video' && (
                  <Video
                    source={{ uri: item.uri }}
                    style={styles.preview}
                    resizeMode="cover"
                    useNativeControls
                  />
                )}

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeMedia(index)}
                >
                  <Ionicons name="close-circle" size={24} color="red" />
                </TouchableOpacity>

              </View>
            ))}
          </ScrollView>
        )}

        {/* POLL UI */}
        {showPoll && (
          <View style={styles.pollContainer}>
            <TextInput
              placeholder="Poll Question"
              style={styles.pollInput}
              value={pollQuestion}
              onChangeText={setPollQuestion}
            />

            {options.map((option, index) => (
              <TextInput
                key={index}
                placeholder={`Option ${index + 1}`}
                style={styles.pollInput}
                value={option}
                onChangeText={(text) => {
                  const updated = [...options];
                  updated[index] = text;
                  setOptions(updated);
                }}
              />
            ))}

            <TouchableOpacity
              onPress={() => setOptions([...options, ''])}
              style={styles.addOptionBtn}
            >
              <Text style={{ color: '#8e24aa' }}>+ Add Option</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ICON ROW */}
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={pickImage}>
            <MaterialIcons name="photo-library" size={26} color="#1976d2" />
          </TouchableOpacity>

          <TouchableOpacity onPress={openCamera}>
            <Ionicons name="camera-outline" size={26} color="#d32f2f" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEmojiModal(true)}>
            <Ionicons name="happy-outline" size={26} color="#f9a825" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowPoll(!showPoll)}>
            <FontAwesome5 name="poll" size={22} color="#8e24aa" />
          </TouchableOpacity>
        </View>

      </View>

      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>

      {/* EMOJI MODAL */}
      <Modal visible={emojiModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.emojiBox}>
            <FlatList
              data={emojis}
              numColumns={5}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => addEmoji(item)}>
                  <Text style={styles.emoji}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.successContainer}>
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={50} color="#2e7d32" />
            <Text style={{ marginTop: 10, fontWeight: 'bold' }}>
              Post Added Successfully!
            </Text>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, marginTop:50, backgroundColor:'#f5f5f5' },
  heading: { fontSize:22, fontWeight:'bold', marginBottom:20 },
  postBox: { backgroundColor:'#fff', padding:15, borderRadius:15, borderWidth:1, borderColor:'#ddd' },
  input: { minHeight:80, textAlignVertical:'top' },
  preview: { width:120, height:120, borderRadius:10 },
  mediaWrapper: { marginRight:10, position:'relative' },
  removeBtn: { position:'absolute', top:-8, right:-8, backgroundColor:'#fff', borderRadius:20 },
  iconRow: { flexDirection:'row', justifyContent:'space-around', marginTop:15 },
  pollContainer: { marginTop:15, padding:10, backgroundColor:'#f3e5f5', borderRadius:10 },
  pollInput: { borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginBottom:8, backgroundColor:'#fff' },
  addOptionBtn: { alignItems:'center', marginTop:5 },
  postButton: { backgroundColor:'#2e7d32', padding:15, borderRadius:8, alignItems:'center', marginTop:20 },
  postButtonText: { color:'#fff', fontWeight:'bold' },
  modalContainer: { flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.3)' },
  emojiBox: { backgroundColor:'#fff', padding:20, borderTopLeftRadius:20, borderTopRightRadius:20 },
  emoji: { fontSize:30, margin:10 },
  successContainer: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.4)' },
  successBox: { backgroundColor:'#fff', padding:30, borderRadius:15, alignItems:'center' }
});