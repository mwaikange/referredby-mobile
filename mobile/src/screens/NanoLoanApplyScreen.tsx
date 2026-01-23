import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../lib/api';

interface LoanDetails {
  account_level: string;
  loan_max: number;
  min_amount: number;
  max_amount: number;
  interest_percent: number;
  processing_fee: number;
  due_date: string;
  outstanding_date: string;
  block_date: string;
}

export default function NanoLoanApplyScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [amount, setAmount] = useState<string>('300');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await api.getProfile();
        setLoanDetails({
          account_level: 'NL1',
          loan_max: 1800,
          min_amount: 300,
          max_amount: 1800,
          interest_percent: 28.00,
          processing_fee: 32,
          due_date: '2026-03-26',
          outstanding_date: '2026-04-26',
          block_date: '2026-05-27',
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateLoan = () => {
    if (!loanDetails) return { interest: 0, fee: 0, total: 0 };
    const numAmount = Number(amount) || 0;
    const interest = (numAmount * loanDetails.interest_percent) / 100;
    const fee = loanDetails.processing_fee;
    const total = numAmount + interest + fee;
    return { interest, fee, total };
  };

  const { interest, fee, total } = calculateLoan();

  const handleContinue = async () => {
    if (!termsAccepted || !contractAccepted) {
      Alert.alert('Required', 'Please accept both the Terms and Conditions and the Digital Contract.');
      return;
    }
    
    setSubmitting(true);
    try {
      Alert.alert('Success', 'Your loan application has been submitted successfully!');
      navigation.navigate('Profile' as never);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit loan application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00736e" />
        <Text style={styles.loadingText}>Loading loan details...</Text>
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
        <Text style={styles.title}>REQUEST LOAN</Text>

        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/referredby-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.accountLevel}>
          Account Level: <Text style={styles.bold}>{loanDetails?.account_level}</Text>
        </Text>
        <Text style={styles.loanMax}>LOAN MAX : {loanDetails?.loan_max}</Text>

        <View style={styles.amountInputContainer}>
          <TextInput
            value={amount}
            onChangeText={(text) => {
              const num = Number(text.replace(/[^0-9]/g, ''));
              if (num <= (loanDetails?.max_amount || 1800)) {
                setAmount(text.replace(/[^0-9]/g, ''));
              }
            }}
            keyboardType="numeric"
            style={styles.amountInput}
          />
        </View>
        <Text style={styles.amountRange}>
          Min : NAD {loanDetails?.min_amount} - Max : NAD {loanDetails?.max_amount?.toLocaleString()}
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest ( % )</Text>
            <Text style={styles.detailValue}>{loanDetails?.interest_percent?.toFixed(2)} %</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest ( NAD )</Text>
            <Text style={styles.detailValue}>{interest.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Processing Fee ( NAD )</Text>
            <Text style={styles.detailValue}>{fee.toFixed(2)}</Text>
          </View>
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Repayable ( NAD )</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.datesCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.dateValue}>{loanDetails?.due_date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Outstanding Date</Text>
            <Text style={styles.dateValue}>{loanDetails?.outstanding_date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Block Date</Text>
            <Text style={styles.dateValue}>{loanDetails?.block_date}</Text>
          </View>
        </View>

        <View style={styles.readLinks}>
          <Text style={styles.readLink}>READ: <Text style={styles.linkText}>Terms & Conditions</Text></Text>
          <Text style={styles.readLink}>READ: <Text style={styles.linkText}>Digital Contract</Text></Text>
        </View>

        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and understood the Terms and Conditions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setContractAccepted(!contractAccepted)}
        >
          <View style={[styles.checkbox, contractAccepted && styles.checkboxChecked]}>
            {contractAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read the contract and acknowledge that ticking this box and submitting request constitutes to a digital signature and thus a valid contract.
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              (!termsAccepted || !contractAccepted) && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={submitting || !termsAccepted || !contractAccepted}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>CONTINUE</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>BACK</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#000000',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    height: 50,
    width: 150,
  },
  accountLevel: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 4,
    color: '#000000',
  },
  bold: {
    fontWeight: 'bold',
  },
  loanMax: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  amountInputContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  amountRange: {
    textAlign: 'center',
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 16,
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  datesCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  dateValue: {
    fontSize: 13,
    color: '#000000',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  readLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  readLink: {
    fontSize: 11,
    color: '#6b7280',
  },
  linkText: {
    color: '#00736e',
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#00736e',
    borderColor: '#00736e',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 11,
    color: '#6b7280',
    flex: 1,
    lineHeight: 16,
  },
  buttonContainer: {
    gap: 12,
    paddingBottom: 16,
  },
  continueButton: {
    backgroundColor: 'rgba(0, 115, 110, 0.5)',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(0, 115, 110, 0.5)',
  },
  backButton: {
    backgroundColor: '#C41E3A',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
