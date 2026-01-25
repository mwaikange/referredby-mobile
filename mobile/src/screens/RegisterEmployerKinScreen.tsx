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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterEmployerKin'>;

const INCOME_SOURCES = ['Salary', 'Self Employed', 'Pension', 'Business Income', 'Rental Income', 'Other'];

export default function RegisterEmployerKinScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [employerName, setEmployerName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [employerOfficeNumber, setEmployerOfficeNumber] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [sourceOfIncome, setSourceOfIncome] = useState('');
  const [nextOfKinFullName, setNextOfKinFullName] = useState('');
  const [nextOfKinSurname, setNextOfKinSurname] = useState('');
  const [relationship, setRelationship] = useState('');
  const [nextOfKinMobile, setNextOfKinMobile] = useState('');
  const [poBox, setPoBox] = useState('');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [error, setError] = useState('');

  const handleProceed = async () => {
    if (!employerName || !occupation || !sourceOfIncome || !nextOfKinFullName || !nextOfKinSurname || !relationship || !nextOfKinMobile) {
      setError('Please fill in all required fields');
      return;
    }

    await AsyncStorage.setItem('registration_employer', employerName);
    await AsyncStorage.setItem('registration_occupation', occupation);
    await AsyncStorage.setItem('registration_office_number', employerOfficeNumber);
    await AsyncStorage.setItem('registration_employee_code', employeeCode);
    await AsyncStorage.setItem('registration_source_income', sourceOfIncome);
    await AsyncStorage.setItem('registration_source_funds', sourceOfIncome);
    await AsyncStorage.setItem('registration_nok_name', nextOfKinFullName);
    await AsyncStorage.setItem('registration_nok_surname', nextOfKinSurname);
    await AsyncStorage.setItem('registration_nok_relationship', relationship);
    await AsyncStorage.setItem('registration_nok_mobile', nextOfKinMobile);
    await AsyncStorage.setItem('registration_po_box', poBox);

    const mobileNumber = await AsyncStorage.getItem('registration_mobile') || '+264XXXXXXXXX';
    navigation.navigate('RegisterSetPin', { mobileNumber });
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
          <Text style={styles.title}>EMPLOYER & NEXT OF KIN</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMPLOYER NAME</Text>
              <TextInput style={styles.input} value={employerName} onChangeText={setEmployerName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>OCCUPATION</Text>
              <TextInput style={styles.input} value={occupation} onChangeText={setOccupation} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMPLOYER OFFICE NUMBER</Text>
              <TextInput 
                style={styles.input} 
                value={employerOfficeNumber} 
                onChangeText={setEmployerOfficeNumber}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMPLOYEE CODE</Text>
              <TextInput 
                style={styles.input} 
                value={employeeCode} 
                onChangeText={setEmployeeCode}
                placeholder="E.G. EMP001"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SOURCE OF INCOME/FUNDS</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowIncomeModal(true)}
              >
                <Text style={sourceOfIncome ? styles.dropdownText : styles.dropdownPlaceholder}>
                  {sourceOfIncome || 'Select source of income'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>NEXT OF KIN : FULL NAME</Text>
              <TextInput style={styles.input} value={nextOfKinFullName} onChangeText={setNextOfKinFullName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>NEXT OF KIN : SURNAME</Text>
              <TextInput style={styles.input} value={nextOfKinSurname} onChangeText={setNextOfKinSurname} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>RELATIONSHIP</Text>
              <TextInput style={styles.input} value={relationship} onChangeText={setRelationship} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>NEXT OF KIN : MOBILE NUMBER</Text>
              <TextInput 
                style={styles.input} 
                value={nextOfKinMobile} 
                onChangeText={setNextOfKinMobile}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>P.O. BOX (OPTIONAL)</Text>
              <TextInput style={styles.input} value={poBox} onChangeText={setPoBox} />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
              <Text style={styles.proceedButtonText}>PROCEED</Text>
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

      <Modal visible={showIncomeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={INCOME_SOURCES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSourceOfIncome(item);
                    setShowIncomeModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setShowIncomeModal(false)}
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
  dropdown: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, height: 40, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownText: { fontSize: 14, color: '#111827' },
  dropdownPlaceholder: { fontSize: 14, color: '#9ca3af' },
  dropdownArrow: { color: '#9ca3af' },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  proceedButton: { backgroundColor: '#0B0B3B', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  proceedButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 8, maxHeight: 300, padding: 16 },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalItemText: { fontSize: 14 },
  modalClose: { marginTop: 12, alignItems: 'center' },
  modalCloseText: { color: '#2563eb', fontWeight: '500' },
});
