import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../lib/api';

interface PaymentRecord {
  date: string;
  loan_id: string;
  type: string;
  received: string;
  balance: string;
}

export default function PaymentRecordScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        console.log('📥 Fetching payment history for user:', profile.id);
        
        // First get statement to determine loan type
        const statementData = await api.loans.getStatement(profile.id);
        console.log('📊 Statement response:', statementData);
        
        const loanType = statementData?.loan_type || 'nano';
        
        // Get payment history with loan type
        const historyData = await api.loans.getPaymentHistoryByType(profile.id, loanType);
        console.log('📡 Payment history response:', historyData);
        
        const payments = historyData.payments || [];
        const mappedRecords = payments.map((payment: any) => ({
          date: payment.date || payment.payment_date || '',
          loan_id: payment.loan_id || payment.reference || '',
          type: payment.type || 'payment',
          received: payment.received || `N$${payment.amount?.toFixed(2) || '0.00'}`,
          balance: payment.balance || `N$${payment.remaining_balance?.toFixed(2) || '0.00'}`,
        }));
        
        setRecords(mappedRecords);
      } catch (error) {
        console.error('Error fetching data:', error);
        setRecords([]);
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
        <Text style={styles.loadingText}>Loading payment records...</Text>
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
        <Text style={styles.title}>PAYMENT RECORD</Text>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Date</Text>
            <Text style={styles.headerCell}>Loan_ID</Text>
            <Text style={styles.headerCell}>Type</Text>
            <Text style={styles.headerCell}>Received</Text>
            <Text style={styles.headerCell}>Balance</Text>
          </View>
          {records.map((record, index) => (
            <View 
              key={index} 
              style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
            >
              <Text style={styles.cell}>{record.date}</Text>
              <Text style={[styles.cell, styles.loanIdCell]}>{record.loan_id}</Text>
              <Text style={styles.cell}>{record.type}</Text>
              <Text style={[styles.cell, styles.receivedCell]}>{record.received}</Text>
              <Text style={styles.cell}>{record.balance}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.instructions}>
          Make a payment via the methods listed below then upload the proof of payment to our online agents:
        </Text>

        <View style={styles.buttonsSection}>
          <TouchableOpacity 
            style={styles.tealButton}
            onPress={() => navigation.navigate('Statement' as never)}
          >
            <Text style={styles.buttonText}>VIEW STATEMENT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.disabledButton} disabled>
            <Text style={styles.disabledButtonText}>PAY VIA PAYPULSE APP (COMING SOON)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.disabledButton} disabled>
            <Text style={styles.disabledButtonText}>NEW PAYMENT METHOD COMING SOON</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Statement' as never)}
        >
          <Text style={styles.buttonText}>BACK</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000000',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  headerCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  rowEven: {
    backgroundColor: '#ffffff',
  },
  rowOdd: {
    backgroundColor: '#f9fafb',
  },
  cell: {
    flex: 1,
    fontSize: 9,
    textAlign: 'center',
    color: '#6b7280',
  },
  loanIdCell: {
    color: '#00736e',
    fontWeight: '500',
  },
  receivedCell: {
    color: '#00736e',
  },
  instructions: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 16,
  },
  buttonsSection: {
    gap: 12,
    marginBottom: 16,
  },
  tealButton: {
    backgroundColor: '#00736e',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 115, 110, 0.5)',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backButton: {
    backgroundColor: '#C41E3A',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
});
