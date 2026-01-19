import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
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
      setError(null);
      const result = await api.getInterestConfirmation(userId);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>INTEREST CONFIRMATION</Text>
      </View>

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

      <View style={styles.modeBadge}>
        <Text style={styles.modeBadgeText}>
          Active Interest Mode: {data?.active_interest_mode || data?.rate_basis || '...'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio Interest Rate (PIR)</Text>
        <Text style={styles.sectionText}>
          Base Rate: <Text style={styles.bold}>{data?.pir_percent ? `${data.pir_percent}%` : '...'}</Text>
        </Text>
      </View>

      {data?.iir_enabled && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Interest Rate (IIR)</Text>
          <Text style={styles.sectionText}>Rating-based discount applies:</Text>
          <View style={styles.rateTable}>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>Fair (0-3 ⭐)</Text>
              <Text style={styles.rateValue}>{data?.iir_rates?.fair}%</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>Good (3.5-4 ⭐)</Text>
              <Text style={styles.rateValue}>{data?.iir_rates?.good}%</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>Excellent (4.5-5 ⭐)</Text>
              <Text style={styles.rateValue}>{data?.iir_rates?.excellent}%</Text>
            </View>
          </View>
        </View>
      )}

      {data?.sir_enabled && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Interest Rate (SIR)</Text>
          <Text style={styles.sectionText}>
            Social Discount: <Text style={styles.bold}>Yes ({data?.sir_percent}%)</Text>
          </Text>
        </View>
      )}

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
        <View style={styles.yellowDivider} />
        <View style={styles.yellowRow}>
          <Text style={styles.yellowLabelBold}>Effective Rate:</Text>
          <Text style={styles.yellowValueBold}>{data?.user_effective_rate?.toFixed(2) || '0'}%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fees</Text>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Processing Fee:</Text>
          <Text style={styles.feeValue}>N$ {data?.fees?.processing || 0}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Late Payment Fee:</Text>
          <Text style={styles.feeValue}>N$ {data?.fees?.late_fee || 0}/day</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loan Progression Levels</Text>
        <Text style={styles.subTitle}>Nano Loans:</Text>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>L1:</Text>
          <Text style={styles.levelValue}>N$ {data?.progression_levels?.nano?.L1?.toLocaleString() || 0}</Text>
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>L2:</Text>
          <Text style={styles.levelValue}>N$ {data?.progression_levels?.nano?.L2?.toLocaleString() || 0}</Text>
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>L3:</Text>
          <Text style={styles.levelValue}>N$ {data?.progression_levels?.nano?.L3?.toLocaleString() || 0}</Text>
        </View>

        <Text style={[styles.subTitle, { marginTop: 16 }]}>Term Loans:</Text>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>L1:</Text>
          <Text style={styles.levelValue}>N$ {data?.progression_levels?.term?.L1?.toLocaleString() || 0}</Text>
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>L2:</Text>
          <Text style={styles.levelValue}>N$ {data?.progression_levels?.term?.L2?.toLocaleString() || 0}</Text>
        </View>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>L3:</Text>
          <Text style={styles.levelValue}>N$ {data?.progression_levels?.term?.L3?.toLocaleString() || 0}</Text>
        </View>
      </View>

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
  infoCard: { backgroundColor: '#00736e', margin: 16, padding: 16, borderRadius: 12 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', width: 130, fontSize: 13 },
  infoValue: { color: '#ffffff', flex: 1, fontSize: 13 },
  modeBadge: { backgroundColor: '#eff6ff', marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#bfdbfe' },
  modeBadgeText: { color: '#1e3a8a', fontWeight: 'bold', textAlign: 'center', fontSize: 14 },
  section: { backgroundColor: '#ffffff', marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  sectionText: { fontSize: 14, color: '#374151' },
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
  yellowLabelBold: { fontSize: 16, color: '#92400e', fontWeight: 'bold' },
  yellowValueBold: { fontSize: 18, color: '#92400e', fontWeight: 'bold' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  feeLabel: { fontSize: 14, color: '#374151' },
  feeValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  subTitle: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  levelLabel: { fontSize: 14, color: '#374151' },
  levelValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  footer: { height: 40 },
});
