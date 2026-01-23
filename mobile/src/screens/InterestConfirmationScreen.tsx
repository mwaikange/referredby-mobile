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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { api, InterestConfirmation } from '../lib/api';
import type { RootStackParamList } from '../navigation/types';

type RouteProps = RouteProp<RootStackParamList, 'InterestConfirmation'>;

export default function InterestConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { userId } = route.params;
  const [data, setData] = useState<InterestConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getInterestConfirmation(userId, 'nano');
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
    navigation.navigate('NanoLoanApply' as never);
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
            <Text style={styles.greenValue}>{data?.referring_partner || '...'}</Text>
          </View>
          <View style={styles.greenRow}>
            <Text style={styles.greenLabel}>Lender:</Text>
            <Text style={styles.greenValue}>{data?.lender || '...'}</Text>
          </View>
          <View style={styles.greenRow}>
            <Text style={styles.greenLabel}>Lending Society:</Text>
            <Text style={styles.greenValue}>{data?.lending_society || '...'}</Text>
          </View>
          <View style={styles.greenRow}>
            <Text style={styles.greenLabel}>Borrower:</Text>
            <Text style={styles.greenValue}>{data?.borrower || '...'}</Text>
          </View>
        </View>

        <View style={styles.modeBadge}>
          <Text style={styles.modeBadgeText}>
            Active Interest Mode: {data?.active_interest_mode || data?.rate_basis || 'PIR (Base Rate)'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio Interest Rate (PIR)</Text>
          <Text style={styles.sectionText}>
            Base Rate: <Text style={styles.bold}>{data?.pir_percent ? `${data.pir_percent}%` : '28.00%'}</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subsidized Interest Rate (SIR)</Text>
          <Text style={styles.sectionTextGray}>
            Subsidy: {data?.sir_enabled ? `${data?.sir_percent}%` : 'Not Applied'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fees</Text>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Processing Fee:</Text>
            <Text style={styles.feeValueTeal}>N$ {data?.fees?.processing || '32.00'}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Late Fee (Accumulating Arrears):</Text>
            <Text style={styles.feeValueTeal}>{data?.fees?.late_fee ? `${data.fees.late_fee}%` : '6%'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nano Loan Limits</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Level 1:</Text>
            <Text style={styles.levelValueTeal}>N$ {data?.progression_levels?.nano?.L1?.toLocaleString() || '1800.00'}</Text>
          </View>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Level 2:</Text>
            <Text style={styles.levelValueTeal}>N$ {data?.progression_levels?.nano?.L2?.toLocaleString() || '3200.00'}</Text>
          </View>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Level 3:</Text>
            <Text style={styles.levelValueTeal}>N$ {data?.progression_levels?.nano?.L3?.toLocaleString() || '8500.00'}</Text>
          </View>
        </View>

        <View style={styles.yellowCard}>
          <Text style={styles.yellowTitle}>Your Applicable Rate</Text>
          <View style={styles.yellowRow}>
            <Text style={styles.yellowLabelGray}>Your Rating:</Text>
            <Text style={styles.yellowValue}>{data?.user_star_rating || '0.5'}</Text>
          </View>
          <View style={styles.yellowRow}>
            <Text style={styles.yellowLabelGray}>Your Tier:</Text>
            <Text style={styles.yellowValue}>{data?.user_tier_label || 'Fair (0-3)'}</Text>
          </View>
          <View style={styles.yellowDivider} />
          <View style={styles.yellowRow}>
            <Text style={styles.yellowLabelGray}>Interest Basis:</Text>
            <Text style={styles.yellowValue}>{data?.rate_basis || 'PIR'}</Text>
          </View>
          <View style={styles.yellowRow}>
            <Text style={styles.yellowLabelGray}>Subsidy Status:</Text>
            <Text style={styles.yellowValue}>{data?.sir_enabled ? 'Applied' : 'None'}</Text>
          </View>
          <View style={styles.yellowDivider} />
          <View style={styles.yellowFinalRow}>
            <View>
              <Text style={styles.yellowFinalLabel}>Your Final Interest Rate:</Text>
              <Text style={styles.yellowFinalSubLabel}>(PIR)</Text>
            </View>
            <Text style={styles.yellowFinalValueTeal}>
              {data?.user_effective_rate ? `${data.user_effective_rate.toFixed(2)}%` : '28.00%'}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.proceedButton,
              (data?.can_proceed === false || data?.has_active_loan) && styles.proceedButtonDisabled
            ]}
            onPress={handleProceed}
            disabled={data?.can_proceed === false || data?.has_active_loan}
          >
            <Text style={styles.proceedButtonText}>
              {data?.has_active_loan ? 'ACTIVE LOAN EXISTS' : 'Proceed'}
            </Text>
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
    backgroundColor: '#3b82f6',
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
    letterSpacing: 0.5,
    color: '#000000',
  },
  greenCard: {
    backgroundColor: '#00736e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  greenRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  greenLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
    fontSize: 13,
    width: 130,
  },
  greenValue: {
    color: '#ffffff',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#00736e',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  modeBadge: {
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modeBadgeText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sirSection: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000000',
  },
  sectionText: {
    fontSize: 14,
    color: '#000000',
  },
  sectionTextSmall: {
    fontSize: 12,
    color: '#000000',
  },
  sirRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
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
    paddingVertical: 8,
  },
  rateLabel: {
    fontSize: 14,
    color: '#000000',
  },
  rateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  feeValueTeal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00736e',
  },
  sectionTextGray: {
    fontSize: 14,
    color: '#9ca3af',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  levelLabel: {
    fontSize: 14,
    color: '#000000',
  },
  levelValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  levelValueTeal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00736e',
  },
  yellowCard: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    paddingVertical: 8,
  },
  yellowLabel: {
    fontSize: 14,
    color: '#000000',
  },
  yellowLabelGray: {
    fontSize: 14,
    color: '#6b7280',
  },
  yellowValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  yellowValueSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
  },
  yellowDivider: {
    height: 1,
    backgroundColor: '#fcd34d',
    marginVertical: 16,
    opacity: 0.5,
  },
  yellowFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yellowFinalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  yellowFinalSubLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  yellowFinalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#006f3c',
  },
  yellowFinalValueTeal: {
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
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  proceedButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  backButton: {
    backgroundColor: '#C41E3A',
    height: 54,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
