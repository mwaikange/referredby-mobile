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
  const [creditRating, setCreditRating] = useState<number>(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProfile();
      setProfile(data);
      
      // Fetch credit rating from dedicated endpoint for consistency
      const creditData = await api.loans.getCreditRating(data.id);
      console.log('📊 Credit rating response:', creditData);
      if (creditData?.success && creditData?.rating !== undefined) {
        setCreditRating(creditData.rating);
      } else {
        setCreditRating(data.star_rating || data.credit_rating || 0);
      }
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const decimal = rating - fullStars;
    const hasHalfStar = decimal >= 0.25 && decimal < 0.75;
    const roundUp = decimal >= 0.75;
    
    for (let i = 0; i < 10; i++) {
      if (i < fullStars || (i === fullStars && roundUp)) {
        stars.push(<Text key={i} style={styles.starFilled}>★</Text>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <View key={i} style={styles.halfStarContainer}>
            <Text style={styles.starEmpty}>☆</Text>
            <View style={styles.halfStarOverlay}>
              <Text style={styles.starFilled}>★</Text>
            </View>
          </View>
        );
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

  const rating = creditRating;
  const nanoInstallment = profile?.nano_installment || `MAX | NAD ${profile?.nano_loan_limit || 0}.00`;
  const termInstallment = profile?.term_installment || `MAX | NAD ${profile?.term_loan_limit || 0}.00`;
  const accountLevel = profile?.account_level || 'NL9 / TL0';

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
          <View style={styles.bellIconContainer}>
            <View style={styles.bellOuter}>
              <View style={styles.bellTop} />
              <View style={styles.bellBody} />
              <View style={styles.bellClapper} />
            </View>
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
              {renderStars(rating)}
            </View>
          </View>
        </View>

        <View style={styles.grayLine} />

        <View style={styles.documentsRow}>
          <View style={styles.docItem}>
            <Text style={styles.docLabel}>ID</Text>
            <View style={[styles.docSquare, { backgroundColor: profile?.documents?.national_id ? '#16a34a' : '#ef4444' }]} />
          </View>
          <View style={styles.docItemSpaced}>
            <Text style={styles.docLabel}>Proof of Income</Text>
            <View style={[styles.docSquare, { backgroundColor: profile?.documents?.payslip ? '#16a34a' : '#ef4444' }]} />
          </View>
          <View style={styles.docItemSpaced}>
            <Text style={styles.docLabel}>KYC</Text>
            <View style={[styles.docSquare, { backgroundColor: profile?.documents?.kyc ? '#16a34a' : '#ef4444' }]} />
          </View>
          <View style={styles.settingsIconContainer}>
            <View style={styles.gearOuter}>
              <View style={styles.gearInner} />
            </View>
          </View>
        </View>

        <Text style={styles.updateDeadline}>
          Documents need to update on: Not available
        </Text>

        <TouchableOpacity style={styles.updateButtonDisabled} disabled>
          <Text style={styles.updateButtonTextDisabled}>UPDATE DOCUMENTS</Text>
        </TouchableOpacity>

        <View style={styles.grayLine} />

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
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 0.5,
  },
  bellIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellOuter: {
    width: 20,
    height: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bellTop: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C41E3A',
    position: 'absolute',
    top: 0,
  },
  bellBody: {
    width: 16,
    height: 14,
    borderWidth: 2,
    borderColor: '#C41E3A',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: 'transparent',
  },
  bellClapper: {
    width: 6,
    height: 3,
    backgroundColor: '#C41E3A',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginTop: -1,
  },
  profileInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'right',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  starFilled: {
    fontSize: 18,
    color: '#D4AF37',
  },
  starEmpty: {
    fontSize: 18,
    color: '#d1d5db',
  },
  halfStarContainer: {
    position: 'relative',
    width: 18,
    height: 18,
  },
  halfStarOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 9,
    overflow: 'hidden',
  },
  documentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docItemSpaced: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
  },
  docLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#000000',
  },
  docSquare: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  settingsIconContainer: {
    marginLeft: 'auto',
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearOuter: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#6b7280',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearInner: {
    width: 6,
    height: 6,
    backgroundColor: '#6b7280',
    borderRadius: 3,
  },
  updateDeadline: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 16,
  },
  updateButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  grayLine: {
    height: 1,
    backgroundColor: '#d1d5db',
    width: '100%',
    marginBottom: 8,
  },
  updateButtonTextDisabled: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
    backgroundColor: '#C41E3A',
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
