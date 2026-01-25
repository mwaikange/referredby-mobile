import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../lib/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterKyc'>;

export default function RegisterKycScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a selfie.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelfieUri(result.assets[0].uri);
        const uri = result.assets[0].uri;
        setFileName(uri.split('/').pop() || 'selfie.jpg');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take a selfie.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelfieUri(result.assets[0].uri);
        setFileName('selfie.jpg');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not take photo');
    }
  };

  const handleCameraPress = () => {
    Alert.alert(
      'Upload Selfie',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const [error, setError] = useState('');

  const handleProceed = async () => {
    if (!selfieUri) {
      Alert.alert('Required', 'Please upload a selfie with your ID.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const userId = await AsyncStorage.getItem('registration_user_id');
      if (userId && selfieUri) {
        await api.upload.selfie(userId, selfieUri, fileName || 'selfie.jpg');
      }
      navigation.navigate('RegisterDocuments');
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      Alert.alert('Error', err.message || 'Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerPattern}>
        <Image 
          source={require('../../assets/header-pattern.png')} 
          style={styles.patternImage}
          resizeMode="cover"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>KNOW YOUR CUSTOMER (KYC)</Text>
        <Text style={styles.subtitle}>Upload a Selfie</Text>
        
        <Text style={styles.instructions}>
          Click the camera icon below and upload a selfie with you holding your ID just below your chin and today's date written on a white paper as indicated on the photo below.
        </Text>

        {/* Dark blue camera area */}
        <TouchableOpacity style={styles.cameraArea} onPress={handleCameraPress}>
          {selfieUri ? (
            <Image source={{ uri: selfieUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraEmoji}>📷</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Upload section with gray background accent */}
        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>Upload selfie with ID</Text>
          <View style={styles.fileRow}>
            <TouchableOpacity style={styles.chooseButton} onPress={pickImage}>
              <Text style={styles.chooseButtonText}>CHOOSE FILE</Text>
            </TouchableOpacity>
            <Text style={styles.fileName}>{fileName || 'No file chosen'}</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.proceedButton, (!selfieUri || isLoading) && styles.buttonDisabled]}
          onPress={handleProceed}
          disabled={!selfieUri || isLoading}
        >
          <Text style={styles.proceedButtonText}>
            {isLoading ? 'UPLOADING...' : 'PROCEED'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footerPattern}>
        <Image 
          source={require('../../assets/header-pattern.png')} 
          style={[styles.patternImage, { transform: [{ rotate: '180deg' }] }]}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerPattern: { height: 60, overflow: 'hidden' },
  footerPattern: { height: 60, overflow: 'hidden' },
  patternImage: { width: '100%', height: 60 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  instructions: { fontSize: 11, color: '#6b7280', textAlign: 'center', marginBottom: 16, paddingHorizontal: 8 },
  cameraArea: { backgroundColor: '#0B0B3B', borderRadius: 8, height: 240, alignItems: 'center', justifyContent: 'center', marginBottom: 28, width: '100%' },
  cameraIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  cameraEmoji: { fontSize: 28 },
  previewImage: { width: '100%', height: '100%', borderRadius: 8 },
  uploadSection: { backgroundColor: '#f3f4f6', borderRadius: 8, padding: 16, marginBottom: 20 },
  uploadLabel: { fontSize: 14, color: '#374151', marginBottom: 12 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chooseButton: { backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 },
  chooseButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  fileName: { fontSize: 14, color: '#6b7280', flex: 1 },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  proceedButton: { backgroundColor: '#6B7280', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 'auto' },
  buttonDisabled: { opacity: 0.5 },
  proceedButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
