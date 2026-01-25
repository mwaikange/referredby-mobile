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

interface ActiveLoan {
  id: string;
  reference: string;
  type: 'nano' | 'term';
  status: string;
  received: number;
  interest_percent: number;
  interest_amount: number;
  processing_fee: number;
  total_repayable: number;
  instalment_amount?: number;
  due_date: string;
  outstanding_date: string;
  grace_date: string;
}

export default function StatementScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
  const [loanType, setLoanType] = useState<'nano' | 'term'>('nano');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await api.getProfile();
        setProfile(userProfile);
        
        console.log('📥 Fetching active loans for user:', userProfile.id);
        
        // Fetch active loans from API for the current user
        const activeLoans = await api.loans.getActiveLoans(userProfile.id);
        console.log('📡 Active loans response:', activeLoans);
        
        // Check if user has term loans first, then nano loans
        const termLoans = activeLoans.term_loans || [];
        const nanoLoans = activeLoans.nano_loans || [];
        
        if (termLoans.length > 0) {
          const loan = termLoans[0];
          setLoanType('term');
          setActiveLoan({
            id: loan.id || '',
            reference: loan.reference || loan.loan_id || '',
            type: 'term',
            status: loan.status || 'Due',
            received: loan.received || loan.amount || 0,
            interest_percent: loan.interest_percent || loan.interest_rate || 0,
            interest_amount: loan.interest_amount || loan.interest || 0,
            processing_fee: loan.processing_fee || 0,
            total_repayable: loan.total_repayable || loan.total || 0,
            instalment_amount: loan.instalment_amount || loan.installment_amount,
            due_date: loan.due_date || '',
            outstanding_date: loan.outstanding_date || '',
            grace_date: loan.grace_date || '',
          });
        } else if (nanoLoans.length > 0) {
          const loan = nanoLoans[0];
          setLoanType('nano');
          setActiveLoan({
            id: loan.id || '',
            reference: loan.reference || loan.loan_id || '',
            type: 'nano',
            status: loan.status || 'Due',
            received: loan.received || loan.amount || 0,
            interest_percent: loan.interest_percent || loan.interest_rate || 0,
            interest_amount: loan.interest_amount || loan.interest || 0,
            processing_fee: loan.processing_fee || 0,
            total_repayable: loan.total_repayable || loan.total || 0,
            due_date: loan.due_date || '',
            outstanding_date: loan.outstanding_date || '',
            grace_date: loan.grace_date || '',
          });
        } else {
          // No active loans - show empty state
          setActiveLoan(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
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
        <Text style={styles.loadingText}>Loading statement...</Text>
      </View>
    );
  }

  const loan = activeLoan;
  const isPaidUp = loan?.status?.toLowerCase() === 'paid' || loan?.status?.toLowerCase() === 'paid up';

  if (loanType === 'term') {
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
          <Text style={styles.title}>TERM LOAN STATEMENT</Text>
          <Text style={styles.loanType}>
            LOAN TYPE: <Text style={styles.loanTypeValue}>TERM LOAN</Text>
          </Text>
          <Text style={styles.loanRef}>
            LOAN REFERENCE: <Text style={styles.bold}>{loan?.reference}</Text>{' '}
            <Text style={isPaidUp ? styles.paidUp : styles.due}>{isPaidUp ? 'Paid Up' : 'Due'}</Text>
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Received (NAD)</Text>
              <Text style={styles.detailValue}>{loan?.received?.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest (%)</Text>
              <Text style={styles.detailValue}>{loan?.interest_percent?.toFixed(2)} %</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest (NAD)</Text>
              <Text style={styles.detailValue}>{loan?.interest_amount?.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Processing Fee (NAD)</Text>
              <Text style={styles.detailValue}>{loan?.processing_fee?.toFixed(2)}</Text>
            </View>
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Repayable (NAD)</Text>
              <Text style={styles.totalValue}>{loan?.total_repayable?.toFixed(2)}</Text>
            </View>
            {loan?.instalment_amount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Instalment Amount (NAD)</Text>
                <Text style={styles.detailValue}>{loan?.instalment_amount?.toFixed(2)}</Text>
              </View>
            )}
          </View>

          <View style={styles.datesSection}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Due Date :</Text>
              <Text style={styles.dateValue}>{loan?.due_date}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Outstanding Date :</Text>
              <Text style={styles.dateValue}>{loan?.outstanding_date}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Grace Date :</Text>
              <Text style={styles.dateValue}>{loan?.grace_date}</Text>
            </View>
          </View>

          <Text style={styles.instructions}>
            Make a payment via the methods listed below then upload the proof of payment to our online agents by clicking here:
          </Text>

          <View style={styles.centeredLine} />

          <View style={styles.buttonsSection}>
            <TouchableOpacity 
              style={styles.tealButton}
              onPress={() => navigation.navigate('PaymentRecord' as never)}
            >
              <Text style={styles.buttonText}>PAYMENT RECORD</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.disabledButton} disabled>
              <Text style={styles.disabledButtonText}>PAY VIA PAYPULSE APP (COMING SOON)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.disabledButton} disabled>
              <Text style={styles.disabledButtonText}>NEW PAYMENT METHOD COMING SOON</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bankDetails}>
            <Text style={styles.bankText}>Acc Name: <Text style={styles.bankValue}>Destiny Group Pty LTD</Text></Text>
            <Text style={styles.bankText}>Bank: <Text style={styles.bankValue}>Nedbank Namibia</Text></Text>
            <Text style={styles.bankText}>Acc no: <Text style={styles.bankValue}>6000238099</Text></Text>
            <Text style={styles.bankText}>Account type: <Text style={styles.bankValue}>Cheque</Text></Text>
            <Text style={styles.bankText}>Branch: <Text style={styles.bankValue}>Corporate Branch</Text></Text>
            <Text style={styles.bankText}>Branch Code: <Text style={styles.bankValue}>280173</Text></Text>
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

  // Nano Loan Statement
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
        <Text style={styles.title}>NANO LOAN STATEMENT</Text>
        <Text style={styles.loanType}>
          LOAN TYPE: <Text style={styles.loanTypeValue}>NANO LOAN</Text>
        </Text>
        <Text style={styles.loanRef}>
          LOAN REFERENCE: <Text style={styles.bold}>{loan?.reference}</Text>{' '}
          <Text style={isPaidUp ? styles.paidUp : styles.due}>{isPaidUp ? 'Paid Up' : 'Due'}</Text>
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Received (NAD)</Text>
            <Text style={styles.detailValue}>{loan?.received?.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest (%)</Text>
            <Text style={styles.detailValue}>{loan?.interest_percent?.toFixed(2)} %</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest (NAD)</Text>
            <Text style={styles.detailValue}>{loan?.interest_amount?.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Processing Fee (NAD)</Text>
            <Text style={styles.detailValue}>{loan?.processing_fee?.toFixed(2)}</Text>
          </View>
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Repayable (NAD)</Text>
            <Text style={styles.totalValue}>{loan?.total_repayable?.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.datesSection}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Due Date :</Text>
            <Text style={styles.dateValue}>{loan?.due_date}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Outstanding Date :</Text>
            <Text style={styles.dateValue}>{loan?.outstanding_date}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Grace Date :</Text>
            <Text style={styles.dateValue}>{loan?.grace_date}</Text>
          </View>
        </View>

        <Text style={styles.instructions}>
          Make a payment via the methods listed below then upload the proof of payment to our online agents by clicking here:
        </Text>

        <View style={styles.centeredLine} />

        <View style={styles.buttonsSection}>
          <TouchableOpacity 
            style={styles.tealButton}
            onPress={() => navigation.navigate('PaymentRecord' as never)}
          >
            <Text style={styles.buttonText}>PAYMENT RECORD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.disabledButton} disabled>
            <Text style={styles.disabledButtonText}>PAY VIA PAYPULSE APP (COMING SOON)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.disabledButton} disabled>
            <Text style={styles.disabledButtonText}>NEW PAYMENT METHOD COMING SOON</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bankDetails}>
          <Text style={styles.bankText}>Acc Name: <Text style={styles.bankValue}>Destiny Group Pty LTD</Text></Text>
          <Text style={styles.bankText}>Bank: <Text style={styles.bankValue}>Nedbank Namibia</Text></Text>
          <Text style={styles.bankText}>Acc no: <Text style={styles.bankValue}>6000238099</Text></Text>
          <Text style={styles.bankText}>Account type: <Text style={styles.bankValue}>Cheque</Text></Text>
          <Text style={styles.bankText}>Branch: <Text style={styles.bankValue}>Corporate Branch</Text></Text>
          <Text style={styles.bankText}>Branch Code: <Text style={styles.bankValue}>280173</Text></Text>
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
  due: {
    color: '#dc2626',
    fontWeight: '500',
  },
  paidUp: {
    color: '#22c55e',
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
    borderTopColor: '#e5e7eb',
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
    marginBottom: 16,
    lineHeight: 16,
  },
  centeredLine: {
    height: 1,
    backgroundColor: '#d1d5db',
    width: '75%',
    alignSelf: 'center',
    marginBottom: 24,
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
  yellowButton: {
    backgroundColor: '#facc15',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yellowButtonText: {
    color: '#000000',
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
    backgroundColor: '#0B0B3B',
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
