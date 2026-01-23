import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api, InterestConfirmation } from '../lib/api';

export default function TermInterestConfirmationScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState<InterestConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await api.getProfile();
      const result = await api.getInterestConfirmation(profile.id, 'term');
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (data?.has_active_loan) {
      Alert.alert(
        'Active Loan',
        'You have an active loan. Please settle it before applying for a new one.'
      );
      return;
    }
    Alert.alert('Success', 'Your term loan request has been submitted.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00736e" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
        <Text style={styles.title}>INTEREST CONFIRMATION</Text>

        <View style={styles.greenCard}>
          <View style={styles.greenRow}>
            <Text style={styles.greenLabel}>Referring Partner:</Text>
            <Text style={styles.greenValue}>{data?.referring_partner || 'naatye peno'}</Text>
          </View>
          <View style={styles.greenRow}>
            <Text style={styles.greenLabel}>Lender:</Text>
            <Text style={styles.greenValue}>{data?.lender || 'Destiny Group Pty LTD'}</Text>
          </View>
          <View style={styles.greenRow}>
            <Text style={styles.greenLabel}>Lending Society:</Text>
            <Text style={styles.greenValue}>{data?.lending_society || 'kayia Industries'}</Text>
          </View>
          <View style={styles.greenRow}>
            <Text style={styles.greenLabel}>Borrower:</Text>
            <Text style={styles.greenValue}>{data?.borrower || 'OAKAFOR JOHN'}</Text>
          </View>
        </View>

        <View style={styles.modeBadge}>
          <Text style={styles.modeBadgeText}>
            Active Interest Mode: IIR (Rating-Based)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Term Loan Base Rate</Text>
          <Text style={styles.sectionText}>
            Base Rate: <Text style={styles.bold}>{data?.iir_base ? `${data.iir_base}%` : '27.90%'}</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Interest Rate (IIR)</Text>
          <View style={styles.rateTable}>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>0-3 Stars (Fair):</Text>
              <Text style={styles.rateValue}>{data?.iir_rates?.fair || '27.90'}%</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>4-6 Stars (Good):</Text>
              <Text style={styles.rateValue}>{data?.iir_rates?.good || '18.00'}%</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>7-10 Stars (Excellent):</Text>
              <Text style={styles.rateValue}>{data?.iir_rates?.excellent || '12.45'}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fees</Text>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Processing Fee:</Text>
            <Text style={styles.feeValue}>N$ {data?.fees?.processing || '32.00'}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Late Fee (Accumulating Arrears):</Text>
            <Text style={styles.feeValue}>{data?.fees?.late_fee || '6'}%</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Term Loan Limits</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Level 1:</Text>
            <Text style={styles.levelValue}>N$ 13000.00</Text>
          </View>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Level 2:</Text>
            <Text style={styles.levelValue}>N$ 15000.00</Text>
          </View>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Level 3:</Text>
            <Text style={styles.levelValue}>N$ 20000.00</Text>
          </View>
        </View>

        <View style={styles.yellowCard}>
          <Text style={styles.yellowTitle}>Your Applicable Rate</Text>
          <View style={styles.yellowRow}>
            <Text style={styles.yellowLabel}>Your Rating:</Text>
            <Text style={styles.yellowValue}>{data?.user_star_rating || '0.5'}</Text>
          </View>
          <View style={styles.yellowRow}>
            <Text style={styles.yellowLabel}>Your Tier:</Text>
            <Text style={styles.yellowValue}>{data?.user_tier_label || 'Fair (0-3)'}</Text>
          </View>
          <View style={styles.yellowDivider} />
          <View style={styles.yellowRow}>
            <Text style={styles.yellowLabel}>Interest Basis:</Text>
            <Text style={styles.yellowValue}>IIR</Text>
          </View>
          <View style={styles.yellowRow}>
            <Text style={styles.yellowLabel}>Subsidy Status:</Text>
            <Text style={styles.yellowValue}>None</Text>
          </View>
          <View style={styles.yellowDivider} />
          <View style={styles.yellowFinalRow}>
            <View>
              <Text style={styles.yellowFinalLabel}>Your Final Interest Rate:</Text>
              <Text style={styles.yellowFinalSubLabel}>(IIR)</Text>
            </View>
            <Text style={styles.yellowFinalValue}>
              {data?.user_effective_rate ? `${data.user_effective_rate.toFixed(2)}%` : '27.90%'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceed}
          >
            <Text style={styles.proceedButtonText}>PROCEED</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>BACK</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00736e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000000',
    letterSpacing: 0.5,
  },
  greenCard: {
    backgroundColor: '#00736e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  greenRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  greenLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
    fontSize: 12,
    width: 120,
  },
  greenValue: {
    color: '#ffffff',
    fontSize: 12,
    flex: 1,
  },
  modeBadge: {
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 24,
  },
  modeBadgeText: {
    color: '#1e3a8a',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  sectionText: {
    fontSize: 13,
    color: '#000000',
  },
  bold: {
    fontWeight: 'bold',
  },
  rateTable: {
    marginTop: 8,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rateLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  rateValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  feeLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  feeValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  levelLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  levelValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  yellowCard: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 8,
    marginBottom: 32,
  },
  yellowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  yellowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  yellowLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  yellowValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  yellowDivider: {
    height: 1,
    backgroundColor: '#fcd34d',
    marginVertical: 12,
    opacity: 0.5,
  },
  yellowFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yellowFinalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  yellowFinalSubLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  yellowFinalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00736e',
  },
  buttonContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  proceedButton: {
    backgroundColor: '#0B0B3B',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backButton: {
    backgroundColor: '#C41E3A',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
