import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TermLoans'>;

export default function TermLoansScreen() {
  const navigation = useNavigation<NavigationProp>();

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
        <Text style={styles.title}>TERM LOANS</Text>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            Term loans differ from Nano Loans in the following ways:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• They are repayable over a period of 6 to 12 months.</Text>
            <Text style={styles.bulletItem}>• The maximum loan amount is determined by the Lending Society.</Text>
          </View>

          <Text style={styles.paragraph}>
            However, due to the longer repayment period, traditional loan requirements apply, 
            and the following documentation must be submitted:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • A teller-printed 3-month bank statement, reflecting all three salary deposits, 
              and not older than 3 days.
            </Text>
            <Text style={styles.bulletItem}>• The latest payslip.</Text>
            <Text style={styles.bulletItem}>• A signed bank debit authorization form.</Text>
          </View>

          <Text style={styles.paragraph}>
            All submitted documents will remain valid for the duration of the loan period 
            and must be updated once they expire.
          </Text>

          <Text style={styles.paragraph}>
            Bank debit authorization is mandatory, as loan instalments will be deducted 
            directly from a salaried bank account.
          </Text>

          <Text style={styles.paragraph}>
            Loan disbursement will be made to the verified bank account as per Bank Statement.
          </Text>

          <Text style={styles.paragraph}>
            A credit bureau enquiry, together with the Net Disposable Income (NDI), 
            will be used to assess loan affordability.
          </Text>

          <Text style={styles.paragraph}>Once you have:</Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Updated your bank details,</Text>
            <Text style={styles.bulletItem}>• Submitted your Net Disposable Income, and</Text>
            <Text style={styles.bulletItem}>
              • Completed the bank authorization with all required documentation,
            </Text>
          </View>

          <Text style={styles.paragraph}>
            the "Request Term Loan" button will become available, 
            allowing you to submit a term loan request.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.tealButton}
            onPress={() => navigation.navigate('BankingDetails')}
          >
            <Text style={styles.buttonText}>ENTER BANK DETAILS</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tealButton}
            onPress={() => navigation.navigate('NetDisposableIncome')}
          >
            <Text style={styles.buttonText}>NET DISPOSABLE INCOME</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.darkButton}
            onPress={() => navigation.navigate('BankAuthorization')}
          >
            <Text style={styles.buttonText}>BANK AUTHORIZATION</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.darkButton}
            onPress={() => navigation.navigate('TermInterestConfirmation')}
          >
            <Text style={styles.buttonText}>REQUEST TERM LOAN</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.redButton}
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
  content: {
    marginBottom: 32,
  },
  paragraph: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
  },
  bulletList: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  darkButton: {
    backgroundColor: '#0B0B3B',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tealButton: {
    backgroundColor: '#00736e',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redButton: {
    backgroundColor: '#C41E3A',
    height: 54,
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
