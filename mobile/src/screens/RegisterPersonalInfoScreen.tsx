import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../lib/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterPersonalInfo'>;

const REGIONS = [
  'ERONGO', 'HARDAP', 'KARAS', 'KAVANGO EAST', 'KAVANGO WEST', 'KHOMAS',
  'KUNENE', 'OHANGWENA', 'OMAHEKE', 'OMUSATI', 'OSHANA', 'OSHIKOTO',
  'OTJOZONDJUPA', 'ZAMBEZI'
];

export default function RegisterPersonalInfoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [surname, setSurname] = useState('');
  const [fullNames, setFullNames] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [town, setTown] = useState('');
  const [streetName, setStreetName] = useState('');
  const [physicalAddress, setPhysicalAddress] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const [error, setError] = useState('');

  const filteredRegions = REGIONS.filter(r => 
    r.toLowerCase().includes(regionSearch.toLowerCase())
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleProceed = async () => {
    if (!surname || !fullNames || !idNumber || !mobileNumber || !email || !region) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const uniqueCheck = await api.auth.checkUniqueness(idNumber, mobileNumber, email);
      
      if (uniqueCheck.id_number_exists) {
        setError('This ID number is already registered');
        setIsLoading(false);
        return;
      }
      if (uniqueCheck.mobile_exists) {
        setError('This mobile number is already registered');
        setIsLoading(false);
        return;
      }
      if (uniqueCheck.email_exists) {
        setError('This email is already registered');
        setIsLoading(false);
        return;
      }

      await AsyncStorage.setItem('registration_surname', surname);
      await AsyncStorage.setItem('registration_fullnames', fullNames);
      await AsyncStorage.setItem('registration_id_number', idNumber);
      await AsyncStorage.setItem('registration_mobile', mobileNumber);
      await AsyncStorage.setItem('registration_email', email);
      await AsyncStorage.setItem('registration_region', region);
      await AsyncStorage.setItem('registration_town', town);
      await AsyncStorage.setItem('registration_street', streetName);
      await AsyncStorage.setItem('registration_address', physicalAddress);
      await AsyncStorage.setItem('registration_gender', gender);

      navigation.navigate('RegisterEmployerKin');
    } catch (err: any) {
      setError(err.message || 'Validation failed. Please try again.');
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

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>PERSONAL INFORMATION</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>SURNAME</Text>
              <TextInput style={styles.input} value={surname} onChangeText={setSurname} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAMES</Text>
              <TextInput style={styles.input} value={fullNames} onChangeText={setFullNames} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID NUMBER</Text>
              <TextInput style={styles.input} value={idNumber} onChangeText={setIdNumber} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>MOBILE NUMBER</Text>
              <TextInput 
                style={styles.input} 
                value={mobileNumber} 
                onChangeText={setMobileNumber}
                placeholder="085XXXXXXXX or +264XXXXXXXXX"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
              <Text style={styles.hint}>Format: 085, 081, or 083 (will be converted to +264)</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>REGION</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowRegionModal(true)}
              >
                <Text style={region ? styles.dropdownText : styles.dropdownPlaceholder}>
                  {region || 'START TYPING TO SEARCH...'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>TOWN</Text>
              <TextInput style={styles.input} value={town} onChangeText={setTown} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>STREET NAME</Text>
              <TextInput style={styles.input} value={streetName} onChangeText={setStreetName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHYSICAL ADDRESS</Text>
              <TextInput style={styles.input} value={physicalAddress} onChangeText={setPhysicalAddress} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>GENDER</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity 
                  style={styles.genderOption} 
                  onPress={() => setGender('Male')}
                >
                  <View style={[styles.checkbox, gender === 'Male' && styles.checkboxChecked]}>
                    {gender === 'Male' && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.genderLabel}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.genderOption} 
                  onPress={() => setGender('Female')}
                >
                  <View style={[styles.checkbox, gender === 'Female' && styles.checkboxChecked]}>
                    {gender === 'Female' && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.genderLabel}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
              style={[styles.proceedButton, isLoading && styles.buttonDisabled]} 
              onPress={handleProceed}
              disabled={isLoading}
            >
              <Text style={styles.proceedButtonText}>
                {isLoading ? 'CHECKING...' : 'PROCEED'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footerPattern}>
        <Image 
          source={require('../../assets/header-pattern.png')} 
          style={[styles.patternImage, { transform: [{ rotate: '180deg' }] }]}
          resizeMode="cover"
        />
      </View>

      <Modal visible={showRegionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalSearch}
              placeholder="Search region..."
              value={regionSearch}
              onChangeText={setRegionSearch}
            />
            <FlatList
              data={filteredRegions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setRegion(item);
                    setShowRegionModal(false);
                    setRegionSearch('');
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setShowRegionModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerPattern: { height: 60, overflow: 'hidden' },
  footerPattern: { height: 60, overflow: 'hidden' },
  patternImage: { width: '100%', height: 60 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  form: { flex: 1 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 10, fontWeight: '500', color: '#6b7280', marginBottom: 4, textTransform: 'uppercase' },
  input: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, height: 40, paddingHorizontal: 12, fontSize: 14 },
  hint: { fontSize: 9, color: '#9ca3af', marginTop: 2 },
  dropdown: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, height: 40, paddingHorizontal: 12, justifyContent: 'center' },
  dropdownText: { fontSize: 14, color: '#111827' },
  dropdownPlaceholder: { fontSize: 14, color: '#9ca3af' },
  genderRow: { flexDirection: 'row', gap: 24 },
  genderOption: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#d1d5db', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  checkmark: { color: '#ffffff', fontSize: 12 },
  genderLabel: { fontSize: 14 },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  proceedButton: { backgroundColor: '#0B0B3B', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.7 },
  proceedButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 8, maxHeight: 400, padding: 16 },
  modalSearch: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, height: 40, paddingHorizontal: 12, marginBottom: 12 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalItemText: { fontSize: 14 },
  modalClose: { marginTop: 12, alignItems: 'center' },
  modalCloseText: { color: '#2563eb', fontWeight: '500' },
});
