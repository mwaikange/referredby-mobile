import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { api, UserProfile } from '../lib/api';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = (rating % 1) >= 0.5;
  const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <View style={styles.starContainer}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Text key={`full-${i}`} style={styles.starFilled}>★</Text>
      ))}
      {hasHalfStar && <Text style={styles.starHalf}>★</Text>}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Text key={`empty-${i}`} style={styles.starEmpty}>★</Text>
      ))}
    </View>
  );
};

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
    if (!dateString) return '...';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
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
  const kycStatus = profile?.kyc_status || { id: false, proof_of_income: false, kyc: false };

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.bellIcon}>🔔</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Name</Text>
            <Text style={styles.infoValue}>
              {profile?.account_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || '...'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Client ID</Text>
            <Text style={styles.infoValue}>{profile?.client_id || profile?.id_number || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account UID</Text>
            <Text style={styles.infoValue}>{profile?.uid || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nano Installment</Text>
            <Text style={styles.infoValue}>
              {profile?.nano_installment || (profile?.nano_loan_limit 
                ? `MAX | NAD ${Number(profile.nano_loan_limit).toFixed(2)}` 
                : 'N/A')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Term Installment</Text>
            <Text style={styles.infoValue}>
              {profile?.term_installment || (profile?.term_loan_limit 
                ? `MAX | NAD ${Number(profile.term_loan_limit).toFixed(2)}` 
                : 'N/A')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Level</Text>
            <Text style={styles.infoValue}>
              {profile?.account_level || profile?.membership_status || 'N/A'}
            </Text>
          </View>
          
          <View style={[styles.infoRow, styles.infoRowNoBorder]}>
            <Text style={styles.infoLabel}>Credit Rating</Text>
            <StarRating rating={rating} />
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.docStatusRow}>
          <View style={styles.docItem}>
            <Text style={styles.docLabel}>ID</Text>
            <View style={[
              styles.docBadge, 
              (documents.national_id || kycStatus.id) ? styles.docBadgeGreen : styles.docBadgeGray
            ]} />
          </View>
          <View style={styles.docItem}>
            <Text style={styles.docLabel}>Proof of Income</Text>
            <View style={[
              styles.docBadge, 
              (documents.payslip || kycStatus.proof_of_income) ? styles.docBadgeGreen : styles.docBadgeGray
            ]} />
          </View>
          <View style={styles.docItem}>
            <Text style={styles.docLabel}>KYC</Text>
            <View style={[
              styles.docBadge, 
              (documents.kyc || kycStatus.kyc) ? styles.docBadgeGreen : styles.docBadgeGray
            ]} />
          </View>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </View>

        <Text style={styles.deadlineText}>
          Documents need to update on: {formatDeadline(profile?.document_deadline) || profile?.documents_update_due || '...'}
        </Text>

        <TouchableOpacity 
          style={[
            styles.updateButton, 
            !profile?.is_doc_update_needed && styles.updateButtonDisabled
          ]}
          disabled={!profile?.is_doc_update_needed}
        >
          <Text style={[
            styles.updateButtonText,
            !profile?.is_doc_update_needed && styles.updateButtonTextDisabled
          ]}>
            Update Documents
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionDivider} />

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.darkButton}
            onPress={() => navigation.navigate('InterestConfirmation', { userId: profile?.id || '', loanType: 'nano' })}
          >
            <Text style={styles.darkButtonText}>REQUEST NANO LOAN</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.darkButton}
            onPress={() => navigation.navigate('TermLoans')}
          >
            <Text style={styles.darkButtonText}>APPLY FOR TERM LOAN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.darkButton}>
            <Text style={styles.darkButtonText}>STATEMENT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.darkButton}>
            <Text style={styles.darkButtonText}>CREDIT SCORE HISTORY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <Text style={styles.signOutButtonText}>SIGN OUT</Text>
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bellIcon: {
    fontSize: 28,
    color: '#ef4444',
  },
  infoGrid: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(249, 250, 251, 1)',
  },
  infoRowNoBorder: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  infoValue: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 1,
  },
  starFilled: {
    fontSize: 14,
    color: '#fbbf24',
  },
  starHalf: {
    fontSize: 14,
    color: '#fbbf24',
    opacity: 0.6,
  },
  starEmpty: {
    fontSize: 14,
    color: '#d1d5db',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 24,
  },
  docStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    textTransform: 'uppercase',
  },
  docBadge: {
    width: 24,
    height: 16,
    borderRadius: 2,
  },
  docBadgeGreen: {
    backgroundColor: '#22c55e',
  },
  docBadgeGray: {
    backgroundColor: '#d1d5db',
  },
  settingsIcon: {
    fontSize: 20,
    color: '#6b7280',
  },
  deadlineText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  updateButton: {
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
  updateButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  updateButtonTextDisabled: {
    color: '#9ca3af',
  },
  actionButtons: {
    gap: 16,
    paddingBottom: 24,
  },
  darkButton: {
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
  darkButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signOutButton: {
    backgroundColor: '#dc2626',
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
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
