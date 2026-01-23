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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api, UserProfile } from '../lib/api';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err: any) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 10; i++) {
      if (i < fullStars) {
        stars.push(<Text key={i} style={styles.starFilled}>★</Text>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Text key={i} style={styles.starFilled}>★</Text>);
      } else {
        stars.push(<Text key={i} style={styles.starEmpty}>☆</Text>);
      }
    }
    return stars;
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

  const rating = profile?.star_rating || profile?.credit_rating || 0;
  const nanoInstallment = profile?.nano_installment || `MAX | NAD ${profile?.nano_loan_limit || 0}`;
  const termInstallment = profile?.term_installment || `MAX | NAD ${profile?.term_loan_limit || 0}`;
  const accountLevel = profile?.account_level || 'NL1 / TL0';

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
        <View style={styles.headerRow}>
          <Text style={styles.title}>PROFILE</Text>
          <View style={styles.headerIcons}>
            <Text style={styles.bellIcon}>🔔</Text>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Name</Text>
            <Text style={styles.infoValue}>{profile?.first_name?.trim()} {profile?.last_name?.trim()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Client ID</Text>
            <Text style={styles.infoValue}>{profile?.id_number}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account UID</Text>
            <Text style={styles.infoValue}>{profile?.uid}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nano Installment</Text>
            <Text style={styles.infoValue}>{nanoInstallment}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Term Installment</Text>
            <Text style={styles.infoValue}>{termInstallment}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Level</Text>
            <Text style={styles.infoValue}>{accountLevel}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.infoLabel}>Credit Rating</Text>
            <View style={styles.starsContainer}>
              <Text style={styles.trophy}>🏆</Text>
              {renderStars(rating)}
            </View>
          </View>
        </View>

        <View style={styles.documentsRow}>
          <View style={styles.docItem}>
            <Text style={styles.docLabel}>ID</Text>
            <View style={[styles.docDot, { backgroundColor: profile?.documents?.national_id ? '#22c55e' : '#ef4444' }]} />
          </View>
          <View style={styles.docItem}>
            <Text style={styles.docLabel}>Proof of Income</Text>
            <View style={[styles.docDot, { backgroundColor: profile?.documents?.payslip ? '#22c55e' : '#ef4444' }]} />
          </View>
          <View style={styles.docItem}>
            <Text style={styles.docLabel}>KYC</Text>
            <View style={[styles.docDot, { backgroundColor: profile?.documents?.kyc ? '#22c55e' : '#ef4444' }]} />
          </View>
          <Text style={styles.docSettings}>⚙️</Text>
        </View>

        <Text style={styles.updateDeadline}>
          Documents need to update on: {formatDeadline(profile?.document_deadline) || profile?.documents_update_due || 'Not available'}
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
            UPDATE DOCUMENTS
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

          <TouchableOpacity 
            style={styles.darkButton}
            onPress={() => navigation.navigate('Statement')}
          >
            <Text style={styles.darkButtonText}>STATEMENT</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.darkButton}
            onPress={() => navigation.navigate('CreditScoreHistory')}
          >
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  bellIcon: {
    fontSize: 20,
  },
  settingsIcon: {
    fontSize: 20,
  },
  profileInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trophy: {
    fontSize: 16,
    marginRight: 4,
  },
  starFilled: {
    fontSize: 14,
    color: '#facc15',
  },
  starEmpty: {
    fontSize: 14,
    color: '#d1d5db',
  },
  documentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#000000',
  },
  docDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  docSettings: {
    fontSize: 16,
    marginLeft: 'auto',
    color: '#9ca3af',
  },
  updateDeadline: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 16,
  },
  updateButton: {
    borderWidth: 2,
    borderColor: '#00736e',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  updateButtonDisabled: {
    borderColor: '#e5e7eb',
  },
  updateButtonText: {
    color: '#00736e',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  updateButtonTextDisabled: {
    color: '#9ca3af',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 24,
  },
  actionButtons: {
    gap: 16,
    paddingBottom: 24,
  },
  darkButton: {
    backgroundColor: '#0B0B3B',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  signOutButton: {
    backgroundColor: '#dc2626',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
