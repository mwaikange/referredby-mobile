import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../navigation/types';
import { api, type ReferralData, type PersonalData, type EmployerData } from '../lib/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterOtp'>;
type RouteProps = RouteProp<RootStackParamList, 'RegisterOtp'>;

export default function RegisterOtpScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { mobileNumber } = route.params;
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleSubmitOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.auth.verifyOtp(mobileNumber, otp, 'registration');
      
      const referral: ReferralData = {
        code: await AsyncStorage.getItem('registration_referral_code') || '',
        lending_society_id: await AsyncStorage.getItem('registration_lending_society_id') || '',
        lending_society_name: await AsyncStorage.getItem('registration_lending_society') || '',
        partner_id: await AsyncStorage.getItem('registration_partner_id') || '',
        staff_code: await AsyncStorage.getItem('registration_staff_code') || '',
        referral_owner_id: await AsyncStorage.getItem('registration_referral_owner_id') || '',
      };

      const personal: PersonalData = {
        full_names: await AsyncStorage.getItem('registration_fullnames') || '',
        surname: await AsyncStorage.getItem('registration_surname') || '',
        id_number: await AsyncStorage.getItem('registration_id_number') || '',
        mobile: await AsyncStorage.getItem('registration_mobile') || '',
        gender: await AsyncStorage.getItem('registration_gender') || 'Male',
        region: await AsyncStorage.getItem('registration_region') || '',
        town: await AsyncStorage.getItem('registration_town') || '',
        street_name: await AsyncStorage.getItem('registration_street') || '',
        physical_address: await AsyncStorage.getItem('registration_address') || '',
        email: await AsyncStorage.getItem('registration_email') || '',
      };

      const employer: EmployerData = {
        employer_name: await AsyncStorage.getItem('registration_employer') || '',
        occupation: await AsyncStorage.getItem('registration_occupation') || '',
        office_number: await AsyncStorage.getItem('registration_office_number') || '',
        employee_code: await AsyncStorage.getItem('registration_employee_code') || '',
        nok_name: await AsyncStorage.getItem('registration_nok_name') || '',
        nok_surname: await AsyncStorage.getItem('registration_nok_surname') || '',
        nok_relationship: await AsyncStorage.getItem('registration_nok_relationship') || '',
        nok_mobile: await AsyncStorage.getItem('registration_nok_mobile') || '',
        po_box: await AsyncStorage.getItem('registration_po_box') || '',
        source_funds: await AsyncStorage.getItem('registration_source_funds') || '',
        source_income: await AsyncStorage.getItem('registration_source_income') || '',
      };

      const pin = await AsyncStorage.getItem('registration_pin') || '';
      
      const signupResult = await api.auth.signup({ referral, personal, employer, pin });
      
      await AsyncStorage.setItem('registration_user_id', signupResult.user_id);
      
      navigation.navigate('RegisterKyc');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      await api.auth.sendOtp(mobileNumber, 'registration');
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  const handleBack = () => {
    navigation.goBack();
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
          <View style={styles.logoSection}>
            <Image 
              source={require('../../assets/referredby-logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>ENTER OTP</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.subtitle}>
            An OTP has been sent to <Text style={styles.mobileNumber}>{mobileNumber}</Text>
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ENTER OTP</Text>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmitOtp}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'CREATING ACCOUNT...' : 'SUBMIT OTP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
              onPress={handleResendOtp}
              disabled={!canResend}
            >
              <Text style={styles.resendIcon}>↺</Text>
              <Text style={styles.resendButtonText}>
                {canResend ? 'RESEND OTP' : `RESEND OTP (${resendTimer}s)`}
              </Text>
            </TouchableOpacity>

            <Text style={styles.validityText}>OTP valid for 10 minutes</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerPattern: { height: 60, overflow: 'hidden' },
  footerPattern: { height: 60, overflow: 'hidden' },
  patternImage: { width: '100%', height: 60 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16 },
  logoSection: { alignItems: 'center', marginBottom: 16 },
  logoImage: { width: 200, height: 50 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backArrow: { fontSize: 20, color: '#374151' },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  mobileNumber: { color: '#2563eb', fontWeight: 'bold' },
  form: { flex: 1 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '500', color: '#6b7280', marginBottom: 4, textTransform: 'uppercase' },
  otpInput: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, height: 48, paddingHorizontal: 12, fontSize: 18, textAlign: 'center', letterSpacing: 8 },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  submitButton: { backgroundColor: '#00736e', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  buttonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  resendButton: { backgroundColor: '#8B4513', height: 48, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 16 },
  resendButtonDisabled: { backgroundColor: '#d1d5db' },
  resendIcon: { color: '#ffffff', fontSize: 18 },
  resendButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  validityText: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
});
