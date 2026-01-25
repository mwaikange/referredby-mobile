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

interface LoanStatement {
  loan_id: string;
  loan_type: 'NANO' | 'TERM';
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
  principal?: number;
  outstanding_balance?: number;
  total_installments?: number;
  paid_installments?: number;
  remaining_installments?: number;
  next_due_date?: string;
  installment_amount?: number;
  lending_society: {
    name: string;
    bank: string;
    account_number: string;
    account_type?: string;
    branch?: string;
    branch_code?: string;
  };
}

export default function StatementScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statement, setStatement] = useState<LoanStatement | null>(null);
  const [loanType, setLoanType] = useState<'nano' | 'term'>('nano');
  const [hasLoans, setHasLoans] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await api.getProfile();
        setProfile(userProfile);
        const profileData = userProfile as any;
        
        console.log('📥 Loading statement for user:', userProfile.id);
        
        // Priority logic from API guidelines:
        // 1. Check for ANY ACTIVE loan first (nano or term) - show the first found
        // 2. Check for ANY PAID-UP loan (nano or term) - show the first found
        // 3. No loans at all
        
        const termLoan = profileData.term_loan;
        const nanoLoan = profileData.nano_loan;
        
        const nanoActive = nanoLoan && nanoLoan.status === 'A';
        const termActive = termLoan && termLoan.status === 'A';
        const nanoPaidUp = nanoLoan && nanoLoan.status === 'PU';
        const termPaidUp = termLoan && termLoan.status === 'PU';
        
        // STEP 1: Check for any ACTIVE loan first
        if (nanoActive || termActive) {
          if (nanoActive) {
            console.log('📊 Found active NANO loan');
            const nanoStatement = await api.loans.getNanoLoanStatement(userProfile.id);
            if (nanoStatement.success !== false && (nanoStatement.statement || nanoStatement.loan_id)) {
              setStatement(nanoStatement.statement || nanoStatement);
              setLoanType('nano');
              setHasLoans(true);
              setLoading(false);
              return;
            }
          }
          if (termActive) {
            console.log('📊 Found active TERM loan');
            const termStatement = await api.loans.getTermLoanStatement(userProfile.id);
            if (termStatement.success !== false && (termStatement.statement || termStatement.loan_id)) {
              setStatement(termStatement.statement || termStatement);
              setLoanType('term');
              setHasLoans(true);
              setLoading(false);
              return;
            }
          }
        }
        
        // STEP 2: Check for any PAID-UP loan
        if (nanoPaidUp || termPaidUp) {
          if (nanoPaidUp) {
            console.log('📊 Found paid-up NANO loan');
            const nanoStatement = await api.loans.getNanoLoanStatement(userProfile.id);
            if (nanoStatement.success !== false && (nanoStatement.statement || nanoStatement.loan_id)) {
              setStatement(nanoStatement.statement || nanoStatement);
              setLoanType('nano');
              setHasLoans(true);
              setLoading(false);
              return;
            }
          }
          if (termPaidUp) {
            console.log('📊 Found paid-up TERM loan');
            const termStatement = await api.loans.getTermLoanStatement(userProfile.id);
            if (termStatement.success !== false && (termStatement.statement || termStatement.loan_id)) {
              setStatement(termStatement.statement || termStatement);
              setLoanType('term');
              setHasLoans(true);
              setLoading(false);
              return;
            }
          }
        }
        
        // STEP 3: No loans found - show empty state
        console.log('📊 No loans found for user');
        setHasLoans(false);
        
      } catch (error) {
        console.error('Error fetching statement:', error);
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

  // Show empty state when no loans at all
  if (!hasLoans || !statement) {
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
          <Text style={styles.title}>STATEMENTS</Text>
          
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>📄</Text>
            </View>
            <Text style={styles.emptyTitle}>No Loans Yet</Text>
            <Text style={styles.emptyText}>
              You haven't taken any loans yet. Apply for a loan to get started.
            </Text>
            
            <TouchableOpacity 
              style={[styles.button, styles.tealButton]}
              onPress={() => navigation.navigate('NanoLoanApply' as never)}
            >
              <Text style={styles.buttonText}>Apply for Nano Loan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.navyButton]}
              onPress={() => navigation.navigate('TermLoanApply' as never)}
            >
              <Text style={styles.buttonText}>Apply for Term Loan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.backButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Back to Profile</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const isPaidUp = statement.status === 'PU';
  const isActive = statement.status === 'A';
  const statusLabel = isPaidUp ? 'Paid Up' : isActive ? 'Active' : 'Due';
  const statusStyle = isPaidUp ? styles.paidUp : isActive ? styles.active : styles.due;

  // Term Loan Statement
  if (loanType === 'term' || statement.loan_type === 'TERM') {
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
            LOAN REFERENCE: <Text style={styles.bold}>{statement.loan_id}</Text>{' '}
            <Text style={statusStyle}>{statusLabel}</Text>
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Principal (NAD)</Text>
              <Text style={styles.detailValue}>{(statement.principal || statement.borrowed_amount)?.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest Rate (%)</Text>
              <Text style={styles.detailValue}>{statement.interest_rate?.toFixed(2)} %</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Processing Fee (NAD)</Text>
              <Text style={styles.detailValue}>{statement.processing_fee?.toFixed(2)}</Text>
            </View>
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Repayable (NAD)</Text>
              <Text style={styles.totalValue}>{statement.total_repayable?.toFixed(2)}</Text>
            </View>
            {(statement.outstanding_balance !== undefined || statement.outstanding_amount > 0) && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Outstanding Balance (NAD)</Text>
                <Text style={[styles.detailValue, styles.redText]}>{(statement.outstanding_balance ?? statement.outstanding_amount)?.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid (NAD)</Text>
              <Text style={[styles.detailValue, styles.greenText]}>{statement.amount_paid?.toFixed(2)}</Text>
            </View>
            {statement.installment_amount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Instalment Amount (NAD)</Text>
                <Text style={styles.detailValue}>{statement.installment_amount?.toFixed(2)}</Text>
              </View>
            )}
            {statement.total_installments && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Instalments</Text>
                <Text style={styles.detailValue}>{statement.paid_installments || 0} of {statement.total_installments} paid</Text>
              </View>
            )}
          </View>

          <View style={styles.datesSection}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Due Date :</Text>
              <Text style={styles.dateValue}>{statement.due_date}</Text>
            </View>
            {statement.next_due_date && (
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Next Due Date :</Text>
                <Text style={styles.dateValue}>{statement.next_due_date}</Text>
              </View>
            )}
            {statement.outstanding_date && (
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Outstanding Date :</Text>
                <Text style={styles.dateValue}>{statement.outstanding_date}</Text>
              </View>
            )}
            {statement.paid_date && (
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Paid Date :</Text>
                <Text style={[styles.dateValue, styles.greenText]}>{statement.paid_date}</Text>
              </View>
            )}
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
            <Text style={styles.bankText}>Acc Name: <Text style={styles.bankValue}>{statement.lending_society?.name}</Text></Text>
            <Text style={styles.bankText}>Bank: <Text style={styles.bankValue}>{statement.lending_society?.bank}</Text></Text>
            <Text style={styles.bankText}>Acc no: <Text style={styles.bankValue}>{statement.lending_society?.account_number}</Text></Text>
            {statement.lending_society?.account_type && (
              <Text style={styles.bankText}>Account type: <Text style={styles.bankValue}>{statement.lending_society.account_type}</Text></Text>
            )}
            {statement.lending_society?.branch && (
              <Text style={styles.bankText}>Branch: <Text style={styles.bankValue}>{statement.lending_society.branch}</Text></Text>
            )}
            {statement.lending_society?.branch_code && (
              <Text style={styles.bankText}>Branch Code: <Text style={styles.bankValue}>{statement.lending_society.branch_code}</Text></Text>
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
          LOAN REFERENCE: <Text style={styles.bold}>{statement.loan_id}</Text>{' '}
          <Text style={statusStyle}>{statusLabel}</Text>
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Borrowed (NAD)</Text>
            <Text style={styles.detailValue}>{statement.borrowed_amount?.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest (%)</Text>
            <Text style={styles.detailValue}>{statement.interest_rate?.toFixed(2)} %</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest (NAD)</Text>
            <Text style={styles.detailValue}>{statement.interest_fee?.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Processing Fee (NAD)</Text>
            <Text style={styles.detailValue}>{statement.processing_fee?.toFixed(2)}</Text>
          </View>
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Repayable (NAD)</Text>
            <Text style={styles.totalValue}>{statement.total_repayable?.toFixed(2)}</Text>
          </View>
          {statement.outstanding_amount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Outstanding Amount (NAD)</Text>
              <Text style={[styles.detailValue, styles.redText]}>{statement.outstanding_amount?.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid (NAD)</Text>
            <Text style={[styles.detailValue, styles.greenText]}>{statement.amount_paid?.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.datesSection}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Due Date :</Text>
            <Text style={styles.dateValue}>{statement.due_date}</Text>
          </View>
          {statement.outstanding_date && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Outstanding Date :</Text>
              <Text style={styles.dateValue}>{statement.outstanding_date}</Text>
            </View>
          )}
          {statement.paid_date && (
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Paid Date :</Text>
              <Text style={[styles.dateValue, styles.greenText]}>{statement.paid_date}</Text>
            </View>
          )}
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
          <Text style={styles.bankText}>Acc Name: <Text style={styles.bankValue}>{statement.lending_society?.name}</Text></Text>
          <Text style={styles.bankText}>Bank: <Text style={styles.bankValue}>{statement.lending_society?.bank}</Text></Text>
          <Text style={styles.bankText}>Acc no: <Text style={styles.bankValue}>{statement.lending_society?.account_number}</Text></Text>
          {statement.lending_society?.account_type && (
            <Text style={styles.bankText}>Account type: <Text style={styles.bankValue}>{statement.lending_society.account_type}</Text></Text>
          )}
          {statement.lending_society?.branch && (
            <Text style={styles.bankText}>Branch: <Text style={styles.bankValue}>{statement.lending_society.branch}</Text></Text>
          )}
          {statement.lending_society?.branch_code && (
            <Text style={styles.bankText}>Branch Code: <Text style={styles.bankValue}>{statement.lending_society.branch_code}</Text></Text>
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
  due: {
    color: '#dc2626',
    fontWeight: '500',
  },
  active: {
    color: '#2563eb',
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
  redText: {
    color: '#dc2626',
  },
  greenText: {
    color: '#22c55e',
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
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tealButton: {
    backgroundColor: '#00736e',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navyButton: {
    backgroundColor: '#0B0B3B',
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
});
