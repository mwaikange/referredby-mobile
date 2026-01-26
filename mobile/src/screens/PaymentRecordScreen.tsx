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

interface ActivityRecord {
  id?: string;
  entity_id?: string;
  entity_type?: string;
  activity_type?: string;
  new_value?: string;
  note?: string;
  created_at?: string;
  loan_id: string;
  total_repayable?: number;
  loan_type?: 'nano' | 'term';
}

type PaymentRecordRouteParams = {
  PaymentRecord: {
    loanType?: 'nano' | 'term';
    loan_id?: string;
  };
};

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
}

function getActivityTypeLabel(activity: ActivityRecord): string {
  const type = activity.activity_type || '';
  if (type === 'payment') return 'payment';
  if (type === 'disbursement') return 'disburseme...';
  if (type === 'status_change' || type === 'status_update') return 'status_cha...';
  return type.substring(0, 10) + (type.length > 10 ? '...' : '');
}

function getReceivedDisplay(activity: ActivityRecord): string {
  const note = activity.note || '';
  const type = activity.activity_type || '';
  
  if (type === 'payment') {
    const match = note.match(/NAD\s*([\d,.]+)/i);
    if (match) {
      return `N$${match[1]}`;
    }
  }
  
  if (type === 'disbursement') {
    if (note.toLowerCase().includes('paypulse') || note.toLowerCase().includes('paid via')) {
      return note.length > 20 ? note.substring(0, 18) + '...' : note;
    }
    return 'Loan disbursed';
  }
  
  if (type === 'status_change' || type === 'status_update') {
    if (note.toLowerCase().includes('settled') || note.toLowerCase().includes('full payment')) {
      return 'Loan settled - full payment received';
    }
    const statusMatch = note.match(/from\s+(\w+)\s+to\s+(\w+)/i);
    if (statusMatch) {
      return `Loan status changed from ${statusMatch[1]} to ${statusMatch[2]}`;
    }
    return note.length > 25 ? note.substring(0, 23) + '...' : note;
  }
  
  return note.length > 20 ? note.substring(0, 18) + '...' : (note || '-');
}

function getBalanceDisplay(activity: ActivityRecord): string {
  const type = activity.activity_type || '';
  const newValue = activity.new_value || '0.00';
  
  if (type === 'status_change' || type === 'status_update') {
    const note = activity.note || '';
    if (note.toLowerCase().includes('paid up') || note.toLowerCase().includes('pu')) {
      return 'Paid Up';
    }
    if (note.toLowerCase().includes('due') || note.match(/\bDU\b/)) {
      return 'Due';
    }
    const statusMatch = note.match(/to\s+(AA|AD|DU|OT|BL|PU|DE)/i);
    if (statusMatch) {
      const statusLabels: Record<string, string> = {
        'PU': 'Paid Up',
        'DU': 'Due',
        'AD': 'Disbursed',
        'AA': 'Approved',
        'OT': 'Outstanding',
        'BL': 'Blocked',
        'DE': 'Declined'
      };
      return statusLabels[statusMatch[1].toUpperCase()] || statusMatch[1];
    }
  }
  
  return `N$${parseFloat(newValue).toFixed(2)}`;
}

export default function PaymentRecordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<PaymentRecordRouteParams, 'PaymentRecord'>>();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<ActivityRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        console.log('📥 Fetching payment history for user:', profile.id);
        
        const loanId = route.params?.loan_id;
        
        let historyData;
        
        if (loanId) {
          console.log('📋 Fetching payments for loan_id:', loanId);
          historyData = await api.loans.getPaymentHistoryByLoanId(profile.id, loanId);
        } else {
          console.log('📋 Fetching all payments for user');
          historyData = await api.loans.getPaymentHistory(profile.id);
        }
        
        console.log('📡 Payment history response:', JSON.stringify(historyData, null, 2));
        
        if (historyData && historyData.payments && historyData.payments.length > 0) {
          setRecords(historyData.payments);
        } else if (historyData && Array.isArray(historyData) && historyData.length > 0) {
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
            <Text style={styles.headerCell}>Type</Text>
            <Text style={styles.headerCell}>Received</Text>
            <Text style={styles.headerCell}>Balance</Text>
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
                <Text style={styles.cell}>{formatDate(record.created_at)}</Text>
                <Text style={[styles.cell, styles.loanIdCell]}>{record.loan_id}</Text>
                <Text style={styles.cell}>{getActivityTypeLabel(record)}</Text>
                <Text style={[styles.cell, styles.receivedCell]}>{getReceivedDisplay(record)}</Text>
                <Text style={styles.cell}>{getBalanceDisplay(record)}</Text>
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
