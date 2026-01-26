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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { api } from '../lib/api';

interface PaymentRecord {
  id?: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference?: string;
  status?: string;
}

type PaymentRecordRouteParams = {
  PaymentRecord: {
    loanType?: 'nano' | 'term';
    loan_id?: string;
  };
};

export default function PaymentRecordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<PaymentRecordRouteParams, 'PaymentRecord'>>();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loanType, setLoanType] = useState<'nano' | 'term'>('nano');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        console.log('📥 Fetching payment history for user:', profile.id);
        
        // Get loan_id from route params (for specific loan payments)
        const loanId = route.params?.loan_id;
        
        let historyData;
        
        if (loanId) {
          // Fetch payments for specific loan_id
          console.log('📋 Fetching payments for loan_id:', loanId);
          historyData = await api.loans.getPaymentHistoryByLoanId(profile.id, loanId);
        } else {
          // Fetch all payments for user (API now supports this without loan_type)
          console.log('📋 Fetching all payments for user');
          historyData = await api.loans.getPaymentHistory(profile.id);
        }
        
        console.log('📡 Payment history response:', JSON.stringify(historyData, null, 2));
        
        // Handle response - check for payments array
        if (historyData && historyData.payments && historyData.payments.length > 0) {
          setRecords(historyData.payments);
          if (historyData.loan_type) {
            setLoanType(historyData.loan_type);
          }
        } else if (historyData && Array.isArray(historyData) && historyData.length > 0) {
          // Handle if API returns array directly
          setRecords(historyData);
        } else {
          setRecords([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [route.params?.loan_id]);

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
            <Text style={styles.headerCell}>Method</Text>
            <Text style={styles.headerCell}>Amount</Text>
            <Text style={styles.headerCell}>Status</Text>
          </View>
          {records.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No payment records found</Text>
            </View>
          ) : (
            records.map((record, index) => (
              <View 
                key={record.id || index} 
                style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
              >
                <Text style={styles.cell}>{record.payment_date}</Text>
                <Text style={[styles.cell, styles.loanIdCell]}>{record.loan_id}</Text>
                <Text style={styles.cell}>{record.payment_method || 'Transfer'}</Text>
                <Text style={[styles.cell, styles.amountCell]}>N${record.amount?.toFixed(2)}</Text>
                <Text style={styles.cell}>{record.status || 'verified'}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.instructions}>
          Make a payment via the methods listed below then upload the proof of payment to our online agents:
        </Text>

        <View style={styles.buttonsSection}>
          <TouchableOpacity 
            style={styles.tealButton}
            onPress={() => navigation.navigate('Statement')}
          >
            <Text style={styles.buttonText}>VIEW STATEMENT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lightTealButton} disabled>
            <Text style={styles.lightTealButtonText}>PAY VIA PAYPULSE APP (COMING SOON)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lightTealButton} disabled>
            <Text style={styles.lightTealButtonText}>NEW PAYMENT METHOD COMING SOON</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  rowEven: {
    backgroundColor: '#ffffff',
  },
  rowOdd: {
    backgroundColor: '#f9fafb',
  },
  emptyRow: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  cell: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
    color: '#6b7280',
  },
  loanIdCell: {
    color: '#00736e',
    fontWeight: '500',
  },
  amountCell: {
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
  lightTealButton: {
    backgroundColor: '#7dd3c4',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightTealButtonText: {
    color: '#0f766e',
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
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
