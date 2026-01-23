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
  const [scoreBreakdown] = useState({
    earlyPayments: 5,
    onTimePayments: 0,
    latePenalties: 0,
    referralBonus: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        if (profile?.star_rating) {
          setRating(profile.star_rating);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalScore = scoreBreakdown.earlyPayments + scoreBreakdown.onTimePayments - scoreBreakdown.latePenalties + scoreBreakdown.referralBonus;
  const scorePoints = Math.round(rating * 10);

  const renderStars = () => {
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

        <View style={styles.ratingCard}>
          <Text style={styles.ratingLabel}>Current Rating</Text>
          <View style={styles.starsContainer}>
            <Text style={styles.trophy}>🏆</Text>
            {renderStars()}
          </View>
          <Text style={styles.ratingValue}>{rating}/10</Text>
          <Text style={styles.scorePoints}>Score: {scorePoints} points</Text>
        </View>

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
              <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.breakdownText}>On-Time Payments</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#22c55e' }]}>+{scoreBreakdown.onTimePayments} pts</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLabel}>
              <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.breakdownText}>Late Penalties</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#ef4444' }]}>{scoreBreakdown.latePenalties} pts</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLabel}>
              <View style={[styles.dot, { backgroundColor: '#a855f7' }]} />
              <Text style={styles.breakdownText}>Referral Bonus</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#22c55e' }]}>+{scoreBreakdown.referralBonus} pts</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Score</Text>
            <Text style={styles.totalValue}>{totalScore}/100</Text>
          </View>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Rating History</Text>
          
          <View style={styles.historyItem}>
            <View>
              <Text style={styles.historyTitle}>Early Settlement</Text>
              <Text style={styles.historyDate}>14/12/25 - NL10133474</Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyPoints}>+5</Text>
              <Text style={styles.historyRating}>0.5</Text>
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
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 8,
  },
  trophy: {
    fontSize: 24,
    marginRight: 8,
  },
  starFilled: {
    fontSize: 20,
    color: '#facc15',
  },
  starEmpty: {
    fontSize: 20,
    color: '#d1d5db',
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00736e',
  },
  scorePoints: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  breakdownCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
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
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
    marginBottom: 24,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  historyDate: {
    fontSize: 12,
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
    fontSize: 12,
    color: '#9ca3af',
  },
  buttonContainer: {
    paddingBottom: 24,
  },
  backButton: {
    backgroundColor: '#00736e',
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
