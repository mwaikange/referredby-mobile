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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../navigation/types';
import { api } from '../lib/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterReferral'>;

export default function RegisterReferralScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await api.referrals.validate(referralCode.trim());
      
      await AsyncStorage.setItem('registration_referral_code', data.code || referralCode);
      await AsyncStorage.setItem('registration_lending_society_id', data.lending_society_id);
      await AsyncStorage.setItem('registration_lending_society', data.lending_society_name);
      await AsyncStorage.setItem('registration_partner_id', data.partner_id);
      await AsyncStorage.setItem('registration_staff_code', data.staff_code);
      await AsyncStorage.setItem('registration_referral_owner_id', data.referral_owner_id);
      
      navigation.navigate('RegisterLinkCommunity', {
        referralPartner: data.staff_code || '',
        lendingSociety: data.lending_society_name,
        portfolioHolder: data.partner_id,
      });
    } catch (err: any) {
      setError(err.message || 'Invalid or expired referral code');
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

          <View style={styles.form}>
            <Text style={styles.label}>REFERRAL CODE</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.clipboardIcon}>📋</Text>
              <TextInput
                style={styles.input}
                value={referralCode}
                onChangeText={setReferralCode}
                placeholder=""
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'VALIDATING...' : 'SIGN UP'}
              </Text>
            </TouchableOpacity>

            <View style={styles.linksSection}>
              <Text style={styles.linkText}>
                Back to Login - <Text style={styles.linkBlue} onPress={() => navigation.navigate('Login')}>Click Here</Text>
              </Text>
              <Text style={styles.linkText}>
                Forgot Password - <Text style={styles.linkBlue} onPress={() => navigation.navigate('ForgotPassword')}>Click Here</Text>
              </Text>
              <Text style={styles.linkText}>
                Talk to an Agent - <Text style={styles.linkBlue}>Click Here</Text>
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLinks}>
              <Text style={styles.footerLink}>Terms of Service</Text>
              <Text style={styles.footerDivider}>|</Text>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </View>
            <Text style={styles.version}>Version 2.0.0.1</Text>
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
    marginTop: 24,
    marginBottom: 48,
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.5)',
    borderWidth: 2,
    borderColor: '#facc15',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  clipboardIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  signupButton: {
    backgroundColor: '#0B0B3B',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
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
