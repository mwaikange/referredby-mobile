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

// Rating is 0-10 scale, display as stars (each star = 2 points)
const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  const normalizedRating = rating / 2; // Convert 0-10 to 0-5 for display
  for (let i = 1; i <= 5; i++) {
    const filled = normalizedRating >= i;
    const half = normalizedRating >= i - 0.5 && normalizedRating < i;
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

  const formatDeadline = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Check if user is approved (AP2, AA, or AP)
  const isApproved = ['AP2', 'AA', 'AP'].includes(profile?.membership_status || '');

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
  
  // Loan access control
  const nanoLoanEnabled = profile?.nano_loan_enabled ?? profile?.loan_access?.nano ?? true;
  const termLoanEnabled = profile?.term_loan_enabled ?? profile?.loan_access?.term ?? true;
  const canRequestNanoLoan = isApproved && nanoLoanEnabled;
  const canApplyTermLoan = isApproved && termLoanEnabled;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>PROFILE</Text>
      </View>

      {/* Account Details Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Account Details</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.row}>
            <Text style={styles.label}>Account Name:</Text>
            <Text style={styles.value}>
              {profile?.account_name || `${profile?.first_name?.trim()} ${profile?.last_name?.trim()}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account No:</Text>
            <Text style={styles.value}>{profile?.uid || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Client ID:</Text>
            <Text style={styles.value}>{profile?.client_id || profile?.id_number || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Account Level:</Text>
            <Text style={styles.value}>{profile?.account_level || profile?.membership_status || 'Standard'}</Text>
          </View>
        </View>
      </View>

      {/* Loan Limits Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Loan Limits</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.row}>
            <Text style={styles.label}>Nano Limit:</Text>
            <Text style={styles.valueHighlight}>
              {profile?.nano_installment || `N$ ${Number(profile?.nano_loan_limit || 0).toLocaleString()}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Term Limit:</Text>
            <Text style={styles.valueHighlight}>
              {profile?.term_installment || `N$ ${Number(profile?.term_loan_limit || 0).toLocaleString()}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Credit Rating Card (0-10 scale displayed as stars) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Credit Rating</Text>
        </View>
        <View style={styles.ratingContainer}>
          <StarRating rating={rating} />
          <Text style={styles.ratingText}>{rating.toFixed(1)} / 10</Text>
        </View>
      </View>

      {/* Document Status Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Document Status</Text>
        </View>
        <View style={styles.cardContent}>
          <DocumentStatus label="National ID" status={documents.national_id} />
          <DocumentStatus label="Payslip" status={documents.payslip} />
          <DocumentStatus label="KYC Form" status={documents.kyc} />
          
          {profile?.document_deadline && (
            <Text style={styles.deadlineText}>
              Documents need to update on: {formatDeadline(profile.document_deadline)}
            </Text>
          )}
        </View>
        
        {/* Update Documents Button - enabled only if is_doc_update_needed is true */}
        <TouchableOpacity 
          style={[styles.updateButton, !profile?.is_doc_update_needed && styles.updateButtonDisabled]}
          disabled={!profile?.is_doc_update_needed}
        >
          <Text style={[styles.updateButtonText, !profile?.is_doc_update_needed && styles.updateButtonTextDisabled]}>
            Update Documents
          </Text>
        </TouchableOpacity>
      </View>

      {/* Request Nano Loan Button - enabled only if approved AND nano_loan_enabled */}
      <TouchableOpacity
        style={[styles.loanButton, !canRequestNanoLoan && styles.loanButtonDisabled]}
        disabled={!canRequestNanoLoan}
        onPress={() => navigation.navigate('InterestConfirmation', { userId: profile?.id || '', loanType: 'nano' })}
      >
        <Text style={[styles.loanButtonText, !canRequestNanoLoan && styles.loanButtonTextDisabled]}>
          Request Nano Loan
        </Text>
      </TouchableOpacity>

      {/* Apply for Term Loan Button - enabled only if approved AND term_loan_enabled */}
      <TouchableOpacity
        style={[styles.termButton, !canApplyTermLoan && styles.termButtonDisabled]}
        disabled={!canApplyTermLoan}
        onPress={() => navigation.navigate('InterestConfirmation', { userId: profile?.id || '', loanType: 'term' })}
      >
        <Text style={[styles.termButtonText, !canApplyTermLoan && styles.termButtonTextDisabled]}>
          Apply for Term Loan
        </Text>
      </TouchableOpacity>

      {/* View Interest Confirmation */}
      <TouchableOpacity
        style={styles.interestButton}
        onPress={() => navigation.navigate('InterestConfirmation', { userId: profile?.id || '', loanType: 'nano' })}
      >
        <Text style={styles.interestButtonText}>View Interest Confirmation</Text>
      </TouchableOpacity>

      {/* Logout Button */}
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
  value: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },
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
  docPending: { backgroundColor: '#d1d5db' },
  docBadgeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  deadlineText: { marginTop: 12, fontSize: 12, color: '#6b7280', fontStyle: 'italic' },
  updateButton: { backgroundColor: '#fef3c7', margin: 16, marginTop: 8, padding: 14, borderRadius: 8, alignItems: 'center' },
  updateButtonDisabled: { backgroundColor: '#e5e7eb' },
  updateButtonText: { color: '#92400e', fontSize: 14, fontWeight: '600' },
  updateButtonTextDisabled: { color: '#9ca3af' },
  loanButton: { backgroundColor: '#00736e', marginHorizontal: 16, marginTop: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  loanButtonDisabled: { backgroundColor: '#d1d5db' },
  loanButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  loanButtonTextDisabled: { color: '#9ca3af' },
  termButton: { backgroundColor: '#1e3a8a', marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 12, alignItems: 'center' },
  termButtonDisabled: { backgroundColor: '#d1d5db' },
  termButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  termButtonTextDisabled: { color: '#9ca3af' },
  interestButton: { backgroundColor: '#0B0B3B', marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 12, alignItems: 'center' },
  interestButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  logoutButtonText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  footer: { height: 40 },
});
