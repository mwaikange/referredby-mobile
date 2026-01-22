import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { api, InterestConfirmation } from '../lib/api';
import type { RootStackParamList } from '../navigation/types';

type RouteProps = RouteProp<RootStackParamList, 'InterestConfirmation'>;

export default function InterestConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { userId, loanType = 'nano' } = route.params;
  const [data, setData] = useState<InterestConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'nano' | 'term'>(loanType as 'nano' | 'term');

  useEffect(() => {
    loadData();
  }, [userId, selectedType]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getInterestConfirmation(userId, selectedType);
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
    // Navigate to loan application
    Alert.alert('Proceed', 'Proceeding to loan application...');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00736e" />
        <Text style={styles.loadingText}>Loading interest details...</Text>
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

  const isNano = selectedType === 'nano';
  const isTerm = selectedType === 'term';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>INTEREST CONFIRMATION</Text>
      </View>

      {/* Loan Type Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isNano && styles.toggleButtonActive]}
          onPress={() => setSelectedType('nano')}
        >
          <Text style={[styles.toggleText, isNano && styles.toggleTextActive]}>Nano Loan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isTerm && styles.toggleButtonActive]}
          onPress={() => setSelectedType('term')}
        >
          <Text style={[styles.toggleText, isTerm && styles.toggleTextActive]}>Term Loan</Text>
        </TouchableOpacity>
      </View>

      {/* Header Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Referring Partner:</Text>
          <Text style={styles.infoValue}>{data?.referring_partner || '...'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Lender:</Text>
          <Text style={styles.infoValue}>{data?.lender || '...'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Lending Society:</Text>
          <Text style={styles.infoValue}>{data?.lending_society || '...'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Borrower:</Text>
          <Text style={styles.infoValue}>{data?.borrower || '...'}</Text>
        </View>
      </View>

      {/* Active Interest Mode Badge */}
      <View style={styles.modeBadge}>
        <Text style={styles.modeBadgeText}>
          Active Interest Mode: {data?.active_interest_mode || data?.rate_basis || '...'}
        </Text>
      </View>

      {/* NANO LOAN: Show PIR + SIR */}
      {isNano && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio Interest Rate (PIR)</Text>
            <Text style={styles.sectionText}>
              Base Rate: <Text style={styles.bold}>{data?.pir_percent ? `${data.pir_percent}%` : '...'}</Text>
            </Text>
          </View>

          {data?.sir_enabled && (
            <View style={[styles.section, styles.sirSection]}>
              <Text style={styles.sectionTitle}>Subsidized Interest Rate (SIR)</Text>
              <Text style={styles.sectionText}>
                Subsidy Enabled: <Text style={styles.bold}>{data?.sir_percent}%</Text>
              </Text>
              {data?.sir_policy && (
                <Text style={styles.sectionText}>
                  Policy: <Text style={styles.bold}>
                    {data.sir_policy === 'after_pir' ? 'Applies After PIR' : data.sir_policy}
                  </Text>
                </Text>
              )}
            </View>
          )}
        </>
      )}

      {/* TERM LOAN: Show IIR with tiers */}
      {isTerm && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Term Loan Base Rate</Text>
            <Text style={styles.sectionText}>
              Base Rate: <Text style={styles.bold}>{data?.iir_base ? `${data.iir_base}%` : '...'}</Text>
            </Text>
          </View>

          {data?.iir_enabled && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Individual Interest Rate (IIR)</Text>
              <Text style={styles.sectionText}>Rating-based rates:</Text>
              <View style={styles.rateTable}>
                <View style={styles.rateRow}>
                  <Text style={styles.rateLabel}>0-3 Stars (Fair)</Text>
                  <Text style={styles.rateValue}>{data?.iir_rates?.fair}%</Text>
                </View>
                <View style={styles.rateRow}>
                  <Text style={styles.rateLabel}>4-6 Stars (Good)</Text>
                  <Text style={styles.rateValue}>{data?.iir_rates?.good}%</Text>
                </View>
                <View style={styles.rateRow}>
                  <Text style={styles.rateLabel}>7-10 Stars (Excellent)</Text>
                  <Text style={styles.rateValue}>{data?.iir_rates?.excellent}%</Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}

      {/* Your Applicable Rate (Yellow Card) */}
      <View style={styles.yellowCard}>
        <Text style={styles.yellowTitle}>Your Applicable Rate</Text>
        <View style={styles.yellowDivider} />
        <View style={styles.yellowRow}>
          <Text style={styles.yellowLabel}>Your Rating:</Text>
          <Text style={styles.yellowValue}>{data?.user_star_rating || 0} ⭐</Text>
        </View>
        <View style={styles.yellowRow}>
          <Text style={styles.yellowLabel}>Your Tier:</Text>
          <Text style={styles.yellowValue}>{data?.user_tier_label || 'N/A'}</Text>
        </View>
        <View style={styles.yellowRow}>
          <Text style={styles.yellowLabel}>Interest Basis:</Text>
          <Text style={styles.yellowValue}>{data?.rate_basis || 'N/A'}</Text>
        </View>
        <View style={styles.yellowDivider} />
        <View style={styles.yellowRow}>
          <Text style={styles.yellowLabelBold}>Your Final Interest Rate:</Text>
          <Text style={styles.yellowValueBold}>{data?.user_effective_rate?.toFixed(2) || '0'}%</Text>
        </View>
      </View>

      {/* Fees Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fees</Text>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Processing Fee:</Text>
          <Text style={styles.feeValue}>N$ {data?.fees?.processing || 0}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Late Fee (Accumulating Arrears):</Text>
          <Text style={styles.feeValue}>{data?.fees?.late_fee || 0}%</Text>
        </View>
      </View>

      {/* Loan Progression Levels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loan Progression Levels</Text>
        
        {isNano && data?.progression_levels?.nano && (
          <>
            <Text style={styles.subTitle}>Nano Loans:</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Level 1:</Text>
              <Text style={styles.levelValue}>N$ {data.progression_levels.nano.L1?.toLocaleString()}</Text>
            </View>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Level 2:</Text>
              <Text style={styles.levelValue}>N$ {data.progression_levels.nano.L2?.toLocaleString()}</Text>
            </View>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Level 3:</Text>
              <Text style={styles.levelValue}>N$ {data.progression_levels.nano.L3?.toLocaleString()}</Text>
            </View>
          </>
        )}
        
        {isTerm && data?.progression_levels?.term && (
          <>
            <Text style={styles.subTitle}>Term Loans:</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Level 1:</Text>
              <Text style={styles.levelValue}>N$ {data.progression_levels.term.L1?.toLocaleString()}</Text>
            </View>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Level 2:</Text>
              <Text style={styles.levelValue}>N$ {data.progression_levels.term.L2?.toLocaleString()}</Text>
            </View>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Level 3:</Text>
              <Text style={styles.levelValue}>N$ {data.progression_levels.term.L3?.toLocaleString()}</Text>
            </View>
          </>
        )}
      </View>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[styles.proceedButton, !data?.can_proceed && styles.proceedButtonDisabled]}
        onPress={handleProceed}
        disabled={!data?.can_proceed}
      >
        <Text style={styles.proceedButtonText}>
          {data?.has_active_loan ? 'Active Loan Exists' : 'Proceed'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#6b7280' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#ef4444', marginBottom: 16, textAlign: 'center' },
  retryButton: { backgroundColor: '#00736e', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#ffffff', fontWeight: '600' },
  header: { backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { marginBottom: 8 },
  backText: { color: '#00736e', fontSize: 16 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#111827' },
  toggleContainer: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, backgroundColor: '#e5e7eb', borderRadius: 8, padding: 4 },
  toggleButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  toggleButtonActive: { backgroundColor: '#00736e' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  toggleTextActive: { color: '#ffffff' },
  infoCard: { backgroundColor: '#00736e', margin: 16, padding: 16, borderRadius: 12 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', width: 130, fontSize: 13 },
  infoValue: { color: '#ffffff', flex: 1, fontSize: 13 },
  modeBadge: { backgroundColor: '#eff6ff', marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#bfdbfe' },
  modeBadgeText: { color: '#1e3a8a', fontWeight: 'bold', textAlign: 'center', fontSize: 14 },
  section: { backgroundColor: '#ffffff', marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12 },
  sirSection: { backgroundColor: '#dcfce7' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  sectionText: { fontSize: 14, color: '#374151', marginBottom: 4 },
  bold: { fontWeight: 'bold' },
  rateTable: { marginTop: 12 },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rateLabel: { fontSize: 13, color: '#374151' },
  rateValue: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  yellowCard: { backgroundColor: '#fef3c7', marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12 },
  yellowTitle: { fontSize: 16, fontWeight: 'bold', color: '#92400e', textAlign: 'center', marginBottom: 12 },
  yellowDivider: { height: 1, backgroundColor: '#fcd34d', marginVertical: 8 },
  yellowRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  yellowLabel: { fontSize: 14, color: '#92400e' },
  yellowValue: { fontSize: 14, color: '#92400e', fontWeight: '500' },
  yellowLabelBold: { fontSize: 14, color: '#92400e', fontWeight: 'bold' },
  yellowValueBold: { fontSize: 18, color: '#92400e', fontWeight: 'bold' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  feeLabel: { fontSize: 14, color: '#374151', flex: 1 },
  feeValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  subTitle: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 8, marginTop: 4 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  levelLabel: { fontSize: 14, color: '#374151' },
  levelValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  proceedButton: { backgroundColor: '#0B0B3B', marginHorizontal: 16, marginTop: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  proceedButtonDisabled: { backgroundColor: '#9ca3af' },
  proceedButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  footer: { height: 40 },
});
