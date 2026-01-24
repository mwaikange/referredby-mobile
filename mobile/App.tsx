import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import InterestConfirmationScreen from './src/screens/InterestConfirmationScreen';
import TermLoansScreen from './src/screens/TermLoansScreen';
import BankingDetailsScreen from './src/screens/BankingDetailsScreen';
import NetDisposableIncomeScreen from './src/screens/NetDisposableIncomeScreen';
import BankAuthorizationScreen from './src/screens/BankAuthorizationScreen';
import TermInterestConfirmationScreen from './src/screens/TermInterestConfirmationScreen';
import CreditScoreHistoryScreen from './src/screens/CreditScoreHistoryScreen';
import StatementScreen from './src/screens/StatementScreen';
import PaymentRecordScreen from './src/screens/PaymentRecordScreen';
import LoanHistoryScreen from './src/screens/LoanHistoryScreen';
import NanoLoanApplyScreen from './src/screens/NanoLoanApplyScreen';
import TermLoanApplyScreen from './src/screens/TermLoanApplyScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ForgotPasswordOtpScreen from './src/screens/ForgotPasswordOtpScreen';
import ForgotPasswordNewPinScreen from './src/screens/ForgotPasswordNewPinScreen';
import RegisterReferralScreen from './src/screens/RegisterReferralScreen';
import RegisterLinkCommunityScreen from './src/screens/RegisterLinkCommunityScreen';
import RegisterPersonalInfoScreen from './src/screens/RegisterPersonalInfoScreen';
import RegisterEmployerKinScreen from './src/screens/RegisterEmployerKinScreen';
import RegisterSetPinScreen from './src/screens/RegisterSetPinScreen';
import RegisterOtpScreen from './src/screens/RegisterOtpScreen';
import RegisterKycScreen from './src/screens/RegisterKycScreen';
import RegisterDocumentsScreen from './src/screens/RegisterDocumentsScreen';
import RegisterSuccessScreen from './src/screens/RegisterSuccessScreen';
import type { RootStackParamList } from './src/navigation/types';
import { isSupabaseConfigured } from './src/lib/supabase';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message || 'Unknown error'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function ConfigurationError() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Configuration Error</Text>
      <Text style={styles.errorMessage}>
        The app is not properly configured. Please ensure environment variables are set.
      </Text>
    </View>
  );
}

function AppContent() {
  if (!isSupabaseConfigured) {
    return <ConfigurationError />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="InterestConfirmation" component={InterestConfirmationScreen} />
        <Stack.Screen name="TermLoans" component={TermLoansScreen} />
        <Stack.Screen name="BankingDetails" component={BankingDetailsScreen} />
        <Stack.Screen name="NetDisposableIncome" component={NetDisposableIncomeScreen} />
        <Stack.Screen name="BankAuthorization" component={BankAuthorizationScreen} />
        <Stack.Screen name="TermInterestConfirmation" component={TermInterestConfirmationScreen} />
        <Stack.Screen name="CreditScoreHistory" component={CreditScoreHistoryScreen} />
        <Stack.Screen name="Statement" component={StatementScreen} />
        <Stack.Screen name="PaymentRecord" component={PaymentRecordScreen} />
        <Stack.Screen name="LoanHistory" component={LoanHistoryScreen} />
        <Stack.Screen name="NanoLoanApply" component={NanoLoanApplyScreen} />
        <Stack.Screen name="TermLoanApply" component={TermLoanApplyScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ForgotPasswordOtp" component={ForgotPasswordOtpScreen} />
        <Stack.Screen name="ForgotPasswordNewPin" component={ForgotPasswordNewPinScreen} />
        <Stack.Screen name="RegisterReferral" component={RegisterReferralScreen} />
        <Stack.Screen name="RegisterLinkCommunity" component={RegisterLinkCommunityScreen} />
        <Stack.Screen name="RegisterPersonalInfo" component={RegisterPersonalInfoScreen} />
        <Stack.Screen name="RegisterEmployerKin" component={RegisterEmployerKinScreen} />
        <Stack.Screen name="RegisterSetPin" component={RegisterSetPinScreen} />
        <Stack.Screen name="RegisterOtp" component={RegisterOtpScreen} />
        <Stack.Screen name="RegisterKyc" component={RegisterKycScreen} />
        <Stack.Screen name="RegisterDocuments" component={RegisterDocumentsScreen} />
        <Stack.Screen name="RegisterSuccess" component={RegisterSuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#00736e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
