import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../lib/api';

export default function BankingDetailsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [accountName, setAccountName] = useState('');
  const [bank, setBank] = useState('');
  const [branch, setBranch] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        const profileData = profile as any;
        console.log('📥 Loading banking details for user:', profile.id);
        
        setAccountName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
        setBank(profileData.bank_name || '');
        setBranch(profileData.branch || '');
        setBranchCode(profileData.branch_code || '');
        setAccountNumber(profileData.account_number || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00736e" />
        <Text style={styles.loadingText}>Loading banking details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerPattern}>
        <Image 
          source={require('../../assets/header-pattern.png')} 
          style={styles.patternImage}
          resizeMode="cover"
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>BANKING DETAILS</Text>

        <View style={styles.form}>
          <Text style={styles.label}>ACCOUNT NAME</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <Text style={styles.label}>SELECT BANK</Text>
          <View style={styles.selectContainer}>
            <Text style={styles.selectText}>{bank}</Text>
            <Text style={styles.chevron}>▼</Text>
          </View>

          <Text style={styles.label}>BRANCH</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={branch}
              onChangeText={setBranch}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <Text style={styles.label}>BRANCH CODE</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={branchCode}
              onChangeText={setBranchCode}
              keyboardType="number-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <Text style={styles.label}>ACCOUNT NUMBER</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000000',
    letterSpacing: 0.5,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },
  selectContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  selectText: {
    fontSize: 14,
    color: '#000000',
  },
  chevron: {
    fontSize: 12,
    color: '#6b7280',
  },
  buttonContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  saveButton: {
    backgroundColor: '#0B0B3B',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backButton: {
    backgroundColor: '#C41E3A',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
