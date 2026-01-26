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
import { api } from '../lib/api';

export default function CreditScoreHistoryScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0.5);
  const [scoreBreakdown, setScoreBreakdown] = useState({
    earlyPayments: 0,
    onTimePayments: 0,
    latePenalties: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        console.log('📥 Fetching credit rating for user:', profile.id);
        
        // Use the credit rating endpoint for consistent data
        const creditData = await api.loans.getCreditRating(profile.id);
        console.log('📊 Credit rating response:', creditData);
        
        if (creditData?.success && creditData?.rating !== undefined) {
          setRating(creditData.rating);
          
          if (creditData.breakdown) {
            setScoreBreakdown({
              earlyPayments: creditData.breakdown.early_payments || 0,
              onTimePayments: creditData.breakdown.on_time_payments || 0,
              latePenalties: creditData.breakdown.late_penalties || 0,
            });
          }
        } else if (profile?.star_rating !== undefined) {
          setRating(profile.star_rating);
        }
      } catch (error) {
        console.error('Error fetching credit rating:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalScore = scoreBreakdown.earlyPayments + scoreBreakdown.onTimePayments - Math.abs(scoreBreakdown.latePenalties);
  const scorePoints = Math.round(rating * 10);

  const renderStars = () => {
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
            <Text style={styles.starEmptyWhite}>☆</Text>
            <View style={styles.halfStarOverlay}>
              <Text style={styles.starFilled}>★</Text>
            </View>
          </View>
        );
      } else {
        stars.push(<Text key={i} style={styles.starEmptyWhite}>☆</Text>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00736e" />
        <Text style={styles.loadingText}>Loading score history...</Text>
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
        <Text style={styles.title}>CREDIT SCORE HISTORY</Text>

        {/* Green Rating Card */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingLabel}>Current Rating</Text>
          <View style={styles.starsContainer}>
            <Text style={styles.lightning}>⚡</Text>
            {renderStars()}
          </View>
          <Text style={styles.ratingValue}>{rating}/10</Text>
          <Text style={styles.scorePoints}>Score: {scorePoints} points</Text>
        </View>

        {/* Score Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLabel}>
              <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.breakdownText}>Early Payments</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#22c55e' }]}>+{scoreBreakdown.earlyPayments} pts</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLabel}>
              <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.breakdownText}>On-Time Payments</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#3b82f6' }]}>+{scoreBreakdown.onTimePayments} pts</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLabel}>
              <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.breakdownText}>Late Penalties</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#ef4444' }]}>{scoreBreakdown.latePenalties} pts</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Score</Text>
            <Text style={styles.totalValue}>{totalScore}/100</Text>
          </View>
        </View>

        {/* Rating History */}
        <Text style={styles.historyTitle}>Rating History</Text>
        <View style={styles.historyCard}>
          <View style={styles.historyItem}>
            <View style={styles.historyLeft}>
              <Text style={styles.arrowIcon}>↗</Text>
              <View>
                <Text style={styles.historyEventTitle}>Early Settlement</Text>
                <Text style={styles.historyDate}>30/12/25 • NL52886717</Text>
              </View>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyPoints}>+5</Text>
              <Text style={styles.historyRating}>→ N/A</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
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
    marginBottom: 24,
    color: '#000000',
    letterSpacing: 0.5,
  },
  ratingCard: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    marginBottom: 8,
  },
  lightning: {
    fontSize: 18,
    color: '#facc15',
    marginRight: 4,
  },
  starFilled: {
    fontSize: 20,
    color: '#facc15',
  },
  starEmptyWhite: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.3)',
  },
  halfStarContainer: {
    position: 'relative',
    width: 20,
    height: 20,
  },
  halfStarOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 10,
    overflow: 'hidden',
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scorePoints: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  breakdownCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownText: {
    fontSize: 14,
    color: '#000000',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000000',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 24,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrowIcon: {
    fontSize: 16,
    color: '#22c55e',
  },
  historyEventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  historyDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  historyRating: {
    fontSize: 11,
    color: '#9ca3af',
  },
  buttonContainer: {
    paddingBottom: 24,
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
