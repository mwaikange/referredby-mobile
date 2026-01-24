import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RegisterSuccess'>;

export default function RegisterSuccessScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleGoToLogin = async () => {
    await AsyncStorage.removeItem('registration_mobile');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
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

      <View style={styles.content}>
        <Image 
          source={require('../../assets/referredby-logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>

        <Text style={styles.title}>Registration Successful!</Text>

        <Text style={styles.message}>
          Your application has been submitted successfully. Admin will verify your documents and update you via SMS or Email.
        </Text>

        <TouchableOpacity style={styles.loginButton} onPress={handleGoToLogin}>
          <Text style={styles.loginButtonText}>GO TO LOGIN</Text>
        </TouchableOpacity>
      </View>

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
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logo: { width: 180, height: 45, marginBottom: 32 },
  checkCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  checkMark: { fontSize: 32, color: '#22c55e', fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  message: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  loginButton: { backgroundColor: '#0B0B3B', width: '100%', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  loginButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
