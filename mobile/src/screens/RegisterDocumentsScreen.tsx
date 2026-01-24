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
import type { RootStackParamList } from '../navigation/types';

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
                if (type === 'id') setIdFileName(name);
                else setIncomeFileName(name);
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
                if (type === 'id') setIdFileName(name);
                else setIncomeFileName(name);
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

  const handleProceed = () => {
    if (!idFileName || !incomeFileName) {
      Alert.alert('Required', 'Please upload all required documents.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('RegisterSuccess');
    }, 500);
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

        <View style={styles.documentSection}>
          <Text style={styles.documentLabel}>National Identification Card</Text>
          <TouchableOpacity 
            style={styles.fileBox}
            onPress={() => pickDocument('id')}
          >
            <Text style={styles.fileName}>{idFileName || 'No file chosen'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.documentSection}>
          <Text style={styles.documentLabel}>Payslip</Text>
          <TouchableOpacity 
            style={styles.fileBox}
            onPress={() => pickDocument('income')}
          >
            <Text style={styles.fileName}>{incomeFileName || 'No file chosen'}</Text>
          </TouchableOpacity>
        </View>

        {/* Dark blue panel for bottom section */}
        <View style={styles.darkPanel}>
          <Text style={styles.validityNote}>
            All these form will be valid for 6 months only, afterwhich they must all be renewed and re-uploaded.
          </Text>

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
        </View>
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
  documentSection: { marginBottom: 16 },
  documentLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  fileBox: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  fileName: { fontSize: 14, color: '#6b7280' },
  darkPanel: { backgroundColor: '#0B0B3B', borderRadius: 12, padding: 16, marginTop: 'auto' },
  validityNote: { fontSize: 11, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 16 },
  proceedButton: { backgroundColor: '#00736e', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  buttonDisabled: { opacity: 0.5 },
  proceedButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  approvalNote: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
});
