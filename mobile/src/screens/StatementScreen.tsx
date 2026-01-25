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
import { api, UserProfile } from '../lib/api';

interface LoanData {
  loan_id: string;
  loan_type?: 'NANO' | 'TERM';
  status: string;
  borrowed_amount: number;
  interest_rate: number;
  interest_fee: number;
  processing_fee: number;
  total_repayable: number;
  outstanding_amount: number;
  amount_paid: number;
  due_date: string;
  outstanding_date: string | null;
  paid_date: string | null;
  grace_date?: string | null;
  principal?: number;
  outstanding_balance?: number;
  lending_society?: {
    name: string;
    bank: string;
    account_number: string;
    account_type?: string;
    branch?: string;
    branch_code?: string;
  };
}

interface StatementResponse {
  loan: LoanData;
  loan_type: 'nano' | 'term';
  is_active: boolean;
  is_paid_up: boolean;
}

export default function StatementScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statementData, setStatementData] = useState<StatementResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await api.getProfile();
        setProfile(userProfile);
        
        console.log('📥 Loading statement for user:', userProfile.id);
        
        // Use the unified statement endpoint
        const response = await api.loans.getStatement(userProfile.id);
        console.log('📊 Statement response:', response);
        
        if (response && response.loan) {
          setStatementData(response);
        } else {
          setStatementData(null);
        }
        
      } catch (error) {
        console.error('Error fetching statement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusInfo = (status: string | undefined) => {
    if (!status) return { label: 'No Record', style: styles.statusGray };
    switch (status) {
      case 'A': return { label: 'Active', style: styles.statusBlue };
      case 'PU': return { label: 'Paid Up', style: styles.statusGreen };
      case 'DU': return { label: 'Due', style: styles.statusOrange };
      case 'OT': return { label: 'Outstanding', style: styles.statusRed };
      case 'BL': return { label: 'Blocked', style: styles.statusRed };
      default: return { label: status, style: styles.statusGray };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00736e" />
        <Text style={styles.loadingText}>Loading statement...</Text>
      </View>
    );
  }

  const loan = statementData?.loan;
  const loanType = statementData?.loan_type || 'nano';
  const statusInfo = getStatusInfo(loan?.status);
  const isTermLoan = loanType === 'term';
  const loanTypeLabel = isTermLoan ? 'TERM LOAN' : 'NANO LOAN';
  const titleLabel = isTermLoan ? 'TERM LOAN STATEMENT' : 'NANO LOAN STATEMENT';

  // Bank details from API response or fallback
  const bankDetails = loan?.lending_society || {
    name: 'Destiny Group Pty LTD',
    bank: 'Nedbank Namibia',
    account_number: '6000238099',
    account_type: 'Cheque',
    branch: 'Corporate Branch',
    branch_code: '280173',
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{titleLabel}</Text>
        <Text style={styles.loanType}>
          LOAN TYPE: <Text style={styles.loanTypeValue}>{loanTypeLabel}</Text>
        </Text>
        <Text style={styles.loanRef}>
          LOAN REFERENCE: <Text style={styles.bold}>{loan?.loan_id || 'N/A'}</Text>{' '}
          <Text style={statusInfo.style}>{statusInfo.label}</Text>
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{isTermLoan ? 'Principal' : 'Received'} (NAD)</Text>
            <Text style={styles.detailValue}>{loan?.borrowed_amount?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest ( % )</Text>
            <Text style={styles.detailValue}>{loan?.interest_rate?.toFixed(2) || '0.00'} %</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest (NAD )</Text>
            <Text style={styles.detailValue}>{loan?.interest_fee?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Processing Fee(NAD)</Text>
            <Text style={styles.detailValue}>{loan?.processing_fee?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Repayable ( NAD )</Text>
            <Text style={styles.totalValue}>{loan?.total_repayable?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>

        <View style={styles.datesSection}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Due Date :</Text>
            <Text style={styles.dateValue}>{loan?.due_date || '-'}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Outstanding Date :</Text>
            <Text style={styles.dateValue}>{loan?.outstanding_date || '-'}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Grace Date :</Text>
            <Text style={styles.dateValue}>{loan?.grace_date || loan?.paid_date || '-'}</Text>
          </View>
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
          <TouchableOpacity style={styles.outlineButton} disabled>
            <Text style={styles.outlineButtonText}>PAY VIA PAYPULSE APP (COMING SOON)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orangeButton} disabled>
            <Text style={styles.buttonText}>NEW PAYMENT METHOD COMING SOON</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bankDetails}>
          <Text style={styles.bankText}>Acc Name: <Text style={styles.bankValue}>{bankDetails.name}</Text></Text>
          <Text style={styles.bankText}>Bank: <Text style={styles.bankValue}>{bankDetails.bank}</Text></Text>
          <Text style={styles.bankText}>Acc no: <Text style={styles.bankValue}>{bankDetails.account_number}</Text></Text>
          {bankDetails.account_type && (
            <Text style={styles.bankText}>Account type: <Text style={styles.bankValue}>{bankDetails.account_type}</Text></Text>
          )}
          {bankDetails.branch && (
            <Text style={styles.bankText}>Branch: <Text style={styles.bankValue}>{bankDetails.branch}</Text></Text>
          )}
          {bankDetails.branch_code && (
            <Text style={styles.bankText}>Branch Code: <Text style={styles.bankValue}>{bankDetails.branch_code}</Text></Text>
          )}
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => navigation.navigate('LoanHistory' as never)}
          >
            <Text style={styles.buttonText}>HISTORY</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000',
  },
  loanType: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loanTypeValue: {
    color: '#00736e',
    fontWeight: 'bold',
  },
  loanRef: {
    fontSize: 14,
    marginBottom: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  statusGray: {
    color: '#6b7280',
    fontWeight: '500',
  },
  statusBlue: {
    color: '#2563eb',
    fontWeight: '500',
  },
  statusGreen: {
    color: '#22c55e',
    fontWeight: '500',
  },
  statusOrange: {
    color: '#f97316',
    fontWeight: '500',
  },
  statusRed: {
    color: '#dc2626',
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 8,
    marginTop: 8,
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
  datesSection: {
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  dateValue: {
    fontSize: 13,
    color: '#000000',
  },
  instructions: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 16,
  },
  buttonsSection: {
    gap: 12,
    marginBottom: 24,
  },
  tealButton: {
    backgroundColor: '#00736e',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#00736e',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#00736e',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  orangeButton: {
    backgroundColor: '#FF6B35',
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
  bankDetails: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bankText: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  bankValue: {
    fontWeight: '500',
    color: '#000000',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 24,
  },
  historyButton: {
    flex: 1,
    backgroundColor: '#00736e',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#C41E3A',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
