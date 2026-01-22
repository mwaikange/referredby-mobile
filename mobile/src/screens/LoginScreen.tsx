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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
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
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pin,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        navigation.replace('Profile');
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
              source={require('../../assets/logo-group.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.divider} />
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
                <Text style={styles.eyeIcon}>{showPin ? '👁️' : '👁️‍🗨️'}</Text>
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
              <Text style={styles.linkText}>
                Not Yet Registered - <Text style={styles.linkBlue}>Click Here</Text>
              </Text>
              <Text style={styles.linkText}>
                Forgot Password - <Text style={styles.linkBlue}>Click Here</Text>
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
    paddingVertical: 16,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 280,
    height: 100,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#d1d5db',
    marginTop: 24,
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
    borderRadius: 6,
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
    borderRadius: 6,
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
  },
  eyeIcon: {
    fontSize: 20,
    color: '#9ca3af',
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
