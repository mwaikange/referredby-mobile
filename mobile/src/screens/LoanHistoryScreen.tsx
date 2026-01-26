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

interface LoanHistoryRecord {
  date: string;
  loan_id: string;
  status: string;
  type: string;
}

// Format date to dd/mm/yy
const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

export default function LoanHistoryScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<LoanHistoryRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        console.log('📥 Fetching loan history for user:', profile.id);
        
        const historyData = await api.loans.getLoanHistory(profile.id);
        console.log('📡 Loan history response:', JSON.stringify(historyData, null, 2));
        
        // Map API response - expecting { success: true, loans: [...], total_nano, total_term, total_loans }
        if (historyData && historyData.success && historyData.loans) {
          const loans = historyData.loans || [];
          const mappedRecords = loans.map((loan: any) => ({
            date: loan.created_at || loan.date || '',
            loan_id: loan.loan_id || '',
            status: loan.status || 'PENDING',
            type: loan.loan_type || (loan.loan_id?.startsWith('TL') ? 'TERM' : 'NANO'),
          }));
          setRecords(mappedRecords);
          return;
        }
        
        // Fallback parsing
        const loans = historyData.loans || [];
        const mappedRecords = loans.map((loan: any) => ({
          date: loan.created_at || loan.date || '',
          loan_id: loan.loan_id || loan.reference || loan.id || '',
          status: loan.status || 'PENDING',
          type: loan.loan_type || (loan.loan_id?.startsWith('TL') ? 'TERM' : 'NANO'),
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
        <Text style={styles.loadingText}>Loading loan history...</Text>
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
        <Text style={styles.title}>LOAN HISTORY</Text>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Date</Text>
            <Text style={styles.headerCell}>Loan ID</Text>
            <Text style={styles.headerCell}>Status</Text>
            <Text style={styles.headerCell}>Type</Text>
            <Text style={styles.headerCell}>Contract</Text>
          </View>
          {records.map((record, index) => (
            <View 
              key={index} 
              style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
            >
              <Text style={styles.cell}>{formatDate(record.date)}</Text>
              <Text style={[styles.cell, styles.loanIdCell]}>{record.loan_id}</Text>
              <Text style={[styles.cell, styles.statusCell]}>{record.status}</Text>
              <Text style={styles.cell}>{record.type}</Text>
              <View style={styles.contractCell}>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>VIEW</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.instructions}>
          Make a payment via the methods listed below then upload the proof of payment to our online agents by clicking here:
        </Text>

        <View style={styles.buttonsSection}>
          <TouchableOpacity 
            style={styles.tealButton}
            onPress={() => navigation.navigate('PaymentRecord' as never)}
          >
            <Text style={styles.buttonText}>PAYMENT RECORD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lightTealButton} disabled>
            <Text style={styles.lightTealButtonText}>PAY VIA PAYPULSE APP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lightTealButton} disabled>
            <Text style={styles.lightTealButtonText}>NEW PAYMENT METHOD COMING SOON</Text>
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
    fontSize: 10,
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
    alignItems: 'center',
  },
  rowEven: {
    backgroundColor: '#ffffff',
  },
  rowOdd: {
    backgroundColor: '#f9fafb',
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
  statusCell: {
    color: '#dc2626',
    fontWeight: '500',
  },
  contractCell: {
    flex: 1,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
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
