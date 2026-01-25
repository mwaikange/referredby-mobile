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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../lib/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterSetPin'>;
type RouteProps = RouteProp<RootStackParamList, 'RegisterSetPin'>;

export default function RegisterSetPinScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { mobileNumber } = route.params;
  
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!pin || pin.length < 4) {
      setError('PIN must be 4-6 digits');
      return;
    }

    if (pin.length > 6) {
      setError('PIN must be 4-6 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await AsyncStorage.setItem('registration_pin', pin);
      await api.auth.sendOtp(mobileNumber, 'registration');
      navigation.navigate('RegisterOtp', { mobileNumber });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
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
          <View style={styles.logoSection}>
            <Image 
              source={require('../../assets/referredby-logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Set Your PIN</Text>
          <Text style={styles.subtitle}>
            OTP will be sent to: <Text style={styles.mobileNumber}>{mobileNumber}</Text>
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ENTER PIN (4-6 DIGITS)</Text>
              <TextInput
                style={styles.input}
                value={pin}
                onChangeText={(text) => setPin(text.replace(/\D/g, '').slice(0, 6))}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PIN</Text>
              <TextInput
                style={styles.input}
                value={confirmPin}
                onChangeText={(text) => setConfirmPin(text.replace(/\D/g, '').slice(0, 6))}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={isLoading}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? 'SENDING OTP...' : 'CONTINUE'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerPattern: { height: 60, overflow: 'hidden' },
  footerPattern: { height: 60, overflow: 'hidden' },
  patternImage: { width: '100%', height: 60 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoImage: { width: 200, height: 50 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  mobileNumber: { color: '#2563eb' },
  form: { flex: 1 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '500', color: '#6b7280', marginBottom: 4, textTransform: 'uppercase' },
  input: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4, height: 40, paddingHorizontal: 12, fontSize: 14 },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  continueButton: { backgroundColor: '#0B0B3B', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  continueButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
