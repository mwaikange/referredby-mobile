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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterDocuments'>;

export default function RegisterDocumentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [idFileName, setIdFileName] = useState<string | null>(null);
  const [incomeFileName, setIncomeFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickDocument = async (type: 'id' | 'income') => {
    Alert.alert(
      'Choose Document',
      'Select document type',
      [
        {
          text: 'PDF Document',
          onPress: async () => {
            try {
              const DocumentPicker = require('expo-document-picker');
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
              });
              if (!result.canceled && result.assets[0]) {
                const name = result.assets[0].name;
                const uri = result.assets[0].uri;
                if (type === 'id') {
                  setIdFileName(name);
                  setIdFileUri(uri);
                } else {
                  setIncomeFileName(name);
                  setIncomeFileUri(uri);
                }
              }
            } catch (error) {
              Alert.alert('Error', 'Could not pick document');
            }
          },
        },
        {
          text: 'Image (Photo)',
          onPress: async () => {
            try {
              const ImagePicker = require('expo-image-picker');
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant photo library permissions.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
              });
              if (!result.canceled && result.assets[0]) {
                const uri = result.assets[0].uri;
                const name = uri.split('/').pop() || 'document.jpg';
                if (type === 'id') {
                  setIdFileName(name);
                  setIdFileUri(uri);
                } else {
                  setIncomeFileName(name);
                  setIncomeFileUri(uri);
                }
              }
            } catch (error) {
              Alert.alert('Error', 'Could not pick image');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const [idFileUri, setIdFileUri] = useState<string | null>(null);
  const [incomeFileUri, setIncomeFileUri] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleProceed = async () => {
    if (!idFileName || !incomeFileName) {
      Alert.alert('Required', 'Please upload all required documents.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const userId = await AsyncStorage.getItem('registration_user_id');
      if (userId && idFileUri && incomeFileUri) {
        const uploadResult = await api.upload.documents(userId, idFileUri, incomeFileUri);
        
        if (uploadResult.national_id_url && uploadResult.payslip_url) {
          await api.users.updateDocuments(userId, {
            national_id_url: uploadResult.national_id_url,
            payslip_url: uploadResult.payslip_url,
          });
        }
      }
      navigation.navigate('RegisterSuccess');
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
        <Text style={styles.title}>UPLOAD REQUIRED{'\n'}DOCUMENTS</Text>

        {/* National ID Section with gray background accent */}
        <View style={styles.documentSection}>
          <Text style={styles.documentLabel}>National Identification Card</Text>
          <View style={styles.fileRow}>
            <TouchableOpacity style={styles.chooseButton} onPress={() => pickDocument('id')}>
              <Text style={styles.chooseButtonText}>CHOOSE FILE</Text>
            </TouchableOpacity>
            <Text style={styles.fileName}>{idFileName || 'No file chosen'}</Text>
          </View>
        </View>

        {/* Proof of Income Section with gray background accent */}
        <View style={styles.documentSection}>
          <Text style={styles.documentLabel}>Proof of Income</Text>
          <View style={styles.fileRow}>
            <TouchableOpacity style={styles.chooseButton} onPress={() => pickDocument('income')}>
              <Text style={styles.chooseButtonText}>CHOOSE FILE</Text>
            </TouchableOpacity>
            <Text style={styles.fileName}>{incomeFileName || 'No file chosen'}</Text>
          </View>
        </View>

        <Text style={styles.validityNote}>
          All these form will be valid for 6 months only, afterwhich they must be renewed and re-uploaded.
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.proceedButton, (!idFileName || !incomeFileName || isLoading) && styles.buttonDisabled]}
          onPress={handleProceed}
          disabled={!idFileName || !incomeFileName || isLoading}
        >
          <Text style={styles.proceedButtonText}>
            {isLoading ? 'UPLOADING...' : 'PROCEED'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.approvalNote}>
          Please make sure all required documents are uploaded for immediate approval.
        </Text>
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
  scrollContent: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  documentSection: { backgroundColor: '#f3f4f6', borderRadius: 8, padding: 16, marginBottom: 16 },
  documentLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chooseButton: { backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 },
  chooseButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  fileName: { fontSize: 14, color: '#6b7280', flex: 1 },
  validityNote: { fontSize: 11, color: '#6b7280', textAlign: 'center', marginBottom: 20, paddingHorizontal: 16 },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  proceedButton: { backgroundColor: '#0B0B3B', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  buttonDisabled: { opacity: 0.5 },
  proceedButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  approvalNote: { fontSize: 11, color: '#6b7280', textAlign: 'center' },
});
