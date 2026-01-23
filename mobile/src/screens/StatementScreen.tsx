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

export default function StatementScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loanType, setLoanType] = useState<'nano' | 'term'>('nano');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await api.getProfile();
        setProfile(userProfile);
        const status = userProfile.membership_status || '';
        if (status.includes('TL') || status.includes('term')) {
          setLoanType('term');
        } else {
          setLoanType('nano');
        }
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
        <Text style={styles.loadingText}>Loading statement...</Text>
      </View>
    );
  }

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
            LOAN REFERENCE: <Text style={styles.bold}>TL86127543</Text>{' '}
            <Text style={styles.due}>Due</Text>
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Received (NAD)</Text>
              <Text style={styles.detailValue}>8200.00</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest (%)</Text>
              <Text style={styles.detailValue}>15.90 %</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest (NAD)</Text>
              <Text style={styles.detailValue}>1303.80</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Processing Fee (NAD)</Text>
              <Text style={styles.detailValue}>0.00</Text>
            </View>
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Repayable (NAD)</Text>
              <Text style={styles.totalValue}>9586.80</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Instalment Amount (NAD)</Text>
              <Text style={styles.detailValue}>958.68</Text>
            </View>
          </View>

          <View style={styles.datesSection}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Due Date :</Text>
              <Text style={styles.dateValue}>31 October 2026</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Outstanding Date :</Text>
              <Text style={styles.dateValue}>01 December 2026</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Grace Date :</Text>
              <Text style={styles.dateValue}>02 November 2026</Text>
            </View>
          </View>

          <Text style={styles.instructions}>
            Make a payment via the methods listed below then upload the proof of payment to our online agents by clicking here:
          </Text>

          <View style={styles.buttonsSection}>
            <TouchableOpacity style={styles.tealButton}>
              <Text style={styles.buttonText}>PAYMENT RECORD</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.disabledButton} disabled>
              <Text style={styles.disabledButtonText}>PAY VIA PAYPULSE APP (COMING SOON)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.yellowButton}>
              <Text style={styles.yellowButtonText}>NEW PAYMENT METHOD COMING SOON</Text>
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
            <TouchableOpacity style={styles.historyButton}>
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
          LOAN REFERENCE: <Text style={styles.bold}>NL14793071</Text>{' '}
          <Text style={styles.paidUp}>Paid Up</Text>
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Received (NAD)</Text>
            <Text style={styles.detailValue}>4200.00</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest (%)</Text>
            <Text style={styles.detailValue}>14.05 %</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest (NAD)</Text>
            <Text style={styles.detailValue}>590.10</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Processing Fee (NAD)</Text>
            <Text style={styles.detailValue}>40.00</Text>
          </View>
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Repayable (NAD)</Text>
            <Text style={styles.totalValue}>4830.10</Text>
          </View>
        </View>

        <View style={styles.datesSection}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Due Date :</Text>
            <Text style={styles.dateValue}>15 January 2026</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Outstanding Date :</Text>
            <Text style={styles.dateValue}>15 February 2026</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Grace Date :</Text>
            <Text style={styles.dateValue}>17 January 2026</Text>
          </View>
        </View>

        <Text style={styles.instructions}>
          Make a payment via the methods listed below then upload the proof of payment to our online agents by clicking here:
        </Text>

        <View style={styles.buttonsSection}>
          <TouchableOpacity style={styles.tealButton}>
            <Text style={styles.buttonText}>PAYMENT RECORD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.disabledButton} disabled>
            <Text style={styles.disabledButtonText}>PAY VIA PAYPULSE APP (COMING SOON)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.yellowButton}>
            <Text style={styles.yellowButtonText}>NEW PAYMENT METHOD COMING SOON</Text>
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
          <TouchableOpacity style={styles.historyButton}>
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
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButtonText: {
    color: '#9ca3af',
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
    backgroundColor: '#00736e',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
