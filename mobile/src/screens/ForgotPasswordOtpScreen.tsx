import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../lib/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPasswordOtp'>;
type RouteProps = RouteProp<RootStackParamList, 'ForgotPasswordOtp'>;

export default function ForgotPasswordOtpScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { mobileNumber } = route.params;
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitOtp = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.auth.verifyOtp(mobileNumber, otp, 'password_reset');
      await AsyncStorage.setItem('password_reset_otp', otp);
      navigation.navigate('ForgotPasswordNewPin', { mobileNumber });
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP');
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <Image 
              source={require('../../assets/referredby-logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>ENTER OTP</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              placeholderTextColor="#9ca3af"
            />

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmitOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>SUBMIT OTP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.linksSection}>
              <Text style={styles.linkText}>
                Not Yet Registered - <Text style={styles.linkBlue}>Click Here</Text>
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>
                  Already Registered - <Text style={styles.linkBlue}>Click Here</Text>
                </Text>
              </TouchableOpacity>
              <Text style={styles.linkText}>
                Talk to an Agent - <Text style={styles.linkBlue}>Click Here</Text>
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.referredby.com.na/terms-of-service')}>
                <Text style={styles.footerLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.footerDivider}>|</Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://www.referredby.com.na/privacy-policy')}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.version}>Version 2.0.0.1</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footerPattern}>
        <Image 
          source={require('../../assets/header-pattern.png')} 
          style={[styles.patternImage, styles.patternRotated]}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerPattern: {
    height: 60,
    overflow: 'hidden',
  },
  footerPattern: {
    height: 60,
    overflow: 'hidden',
  },
  patternImage: {
    width: '100%',
    height: 60,
  },
  patternRotated: {
    transform: [{ rotate: '180deg' }],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 360,
    height: 60,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
    marginBottom: 8,
    paddingLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(243, 244, 246, 0.5)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#0B0B3B',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  linksSection: {
    alignItems: 'center',
    marginTop: 32,
    gap: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#111827',
  },
  linkBlue: {
    color: '#2563eb',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerLink: {
    fontSize: 12,
    color: 'rgba(59, 130, 246, 0.8)',
    fontWeight: '500',
  },
  footerDivider: {
    fontSize: 12,
    color: 'rgba(59, 130, 246, 0.8)',
  },
  version: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 8,
  },
});
