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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../lib/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 9) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    setIsLoading(true);

    try {
      await api.auth.sendOtp(mobileNumber, 'password_reset');
      navigation.navigate('ForgotPasswordOtp', { mobileNumber });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send OTP. Please try again.');
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
            <Text style={styles.label}>MOBILE NUMBER</Text>
            <TextInput
              style={styles.input}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              placeholder="+264XXXXXXXXX"
              placeholderTextColor="#9ca3af"
            />

            <TouchableOpacity
              style={[styles.sendButton, isLoading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.sendButtonText}>SEND OTP</Text>
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
    fontSize: 16,
    color: '#111827',
    marginBottom: 24,
  },
  sendButton: {
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
  sendButtonText: {
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
