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
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pin) {
      Alert.alert('Error', 'Please enter email and PIN');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pin,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
        return;
      }

      if (!data.session) {
        Alert.alert('Login Failed', 'No session returned');
        return;
      }

      try {
        await api.getProfile();
        navigation.replace('Profile');
      } catch (profileErr: any) {
        Alert.alert('Profile Load Failed', 'Could not load profile data. Please try again.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Login failed');
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
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>ENTER PIN</Text>
            <View style={styles.pinInputContainer}>
              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={setPin}
                secureTextEntry={!showPin}
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity 
                onPress={() => setShowPin(!showPin)}
                style={styles.eyeButton}
              >
                <View style={styles.eyeIconContainer}>
                  <View style={styles.eyeOuter}>
                    <View style={styles.eyeInner} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>LOGIN</Text>
              )}
            </TouchableOpacity>

            <View style={styles.linksSection}>
              <TouchableOpacity onPress={() => navigation.navigate('RegisterReferral')}>
                <Text style={styles.linkText}>
                  Not Yet Registered - <Text style={styles.linkBlue}>Click Here</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.linkText}>
                  Forgot Password - <Text style={styles.linkBlue}>Click Here</Text>
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
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.5)',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    height: 48,
    marginBottom: 24,
  },
  pinInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeOuter: {
    width: 20,
    height: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeInner: {
    width: 6,
    height: 6,
    backgroundColor: '#9ca3af',
    borderRadius: 3,
  },
  loginButton: {
    backgroundColor: '#0B0B3B',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
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
