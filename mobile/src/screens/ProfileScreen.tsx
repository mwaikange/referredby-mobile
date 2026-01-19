import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { api, UserProfile } from '../lib/api';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = rating >= i;
    const half = rating >= i - 0.5 && rating < i;
    stars.push(
      <Text key={i} style={[styles.star, filled || half ? styles.starFilled : styles.starEmpty]}>
        {filled ? '★' : half ? '★' : '☆'}
      </Text>
    );
  }
  return <View style={styles.starContainer}>{stars}</View>;
};

const DocumentStatus = ({ label, status }: { label: string; status: boolean }) => (
  <View style={styles.docRow}>
    <Text style={styles.docLabel}>{label}</Text>
    <View style={[styles.docBadge, status ? styles.docSuccess : styles.docPending]}>
      <Text style={styles.docBadgeText}>{status ? '✓' : '○'}</Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setError(null);
      const data = await api.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace('Login');
  };

  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === undefined) return 'N$ 0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `N$ ${num.toLocaleString()}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00736e" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rating = profile?.borrower_rating ?? profile?.credit_rating ?? 0;
  const documents = profile?.documents || { national_id: false, payslip: false, kyc: false };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>PROFILE</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Account Details</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.row}>
            <Text style={styles.label}>Account Name:</Text>
            <Text style={styles.value}>{profile?.first_name?.trim()} {profile?.last_name?.trim()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account No:</Text>
            <Text style={styles.value}>{profile?.uid || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Client ID:</Text>
            <Text style={styles.value}>{profile?.id_number || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account Level:</Text>
            <Text style={styles.value}>{profile?.membership_status || 'Standard'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Loan Limits</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.row}>
            <Text style={styles.label}>Nano Limit:</Text>
            <Text style={styles.valueHighlight}>{formatCurrency(profile?.nano_loan_limit)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Term Limit:</Text>
            <Text style={styles.valueHighlight}>{formatCurrency(profile?.term_loan_limit)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Credit Rating</Text>
        </View>
        <View style={styles.ratingContainer}>
          <StarRating rating={rating} />
          <Text style={styles.ratingText}>{rating.toFixed(1)} / 5.0</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Document Status</Text>
        </View>
        <View style={styles.cardContent}>
          <DocumentStatus label="National ID" status={documents.national_id} />
          <DocumentStatus label="Payslip" status={documents.payslip} />
          <DocumentStatus label="KYC Form" status={documents.kyc} />
        </View>
        {profile?.is_doc_update_needed && (
          <TouchableOpacity style={styles.updateButton}>
            <Text style={styles.updateButtonText}>Update Documents</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.interestButton}
        onPress={() => navigation.navigate('InterestConfirmation', { userId: profile?.id || '' })}
      >
        <Text style={styles.interestButtonText}>View Interest Confirmation</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 16, color: '#6b7280', fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 24 },
  errorText: { color: '#ef4444', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#00736e', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  header: { backgroundColor: '#ffffff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#111827' },
  card: { backgroundColor: '#ffffff', marginHorizontal: 16, marginTop: 16, borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardHeader: { backgroundColor: '#00736e', padding: 12 },
  cardTitle: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  cardContent: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { fontSize: 14, color: '#6b7280' },
  value: { fontSize: 14, color: '#111827', fontWeight: '500' },
  valueHighlight: { fontSize: 16, color: '#00736e', fontWeight: 'bold' },
  ratingContainer: { padding: 20, alignItems: 'center' },
  starContainer: { flexDirection: 'row', marginBottom: 8 },
  star: { fontSize: 28, marginHorizontal: 2 },
  starFilled: { color: '#fbbf24' },
  starEmpty: { color: '#d1d5db' },
  ratingText: { fontSize: 14, color: '#6b7280' },
  docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  docLabel: { fontSize: 14, color: '#374151' },
  docBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  docSuccess: { backgroundColor: '#22c55e' },
  docPending: { backgroundColor: '#e5e7eb' },
  docBadgeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  updateButton: { backgroundColor: '#fef3c7', margin: 16, marginTop: 8, padding: 14, borderRadius: 8, alignItems: 'center' },
  updateButtonText: { color: '#92400e', fontSize: 14, fontWeight: '600' },
  interestButton: { backgroundColor: '#0B0B3B', marginHorizontal: 16, marginTop: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  interestButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  logoutButtonText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  footer: { height: 40 },
});
