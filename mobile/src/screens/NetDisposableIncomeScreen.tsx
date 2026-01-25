import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../lib/api';

export default function NetDisposableIncomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [netSalary, setNetSalary] = useState('');
  const [rentBond, setRentBond] = useState('');
  const [food, setFood] = useState('');
  const [transport, setTransport] = useState('');
  const [loans, setLoans] = useState('');
  const [otherExpenses, setOtherExpenses] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        const profileData = profile as any;
        console.log('📥 Loading NDI data for user:', profile.id);
        
        // Prefill net salary from profile if available
        if (profileData?.net_salary) {
          setNetSalary(profileData.net_salary.toString());
        } else if (profileData?.monthly_salary) {
          setNetSalary(profileData.monthly_salary.toString());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalExpenses = 
    (parseFloat(rentBond) || 0) + 
    (parseFloat(food) || 0) + 
    (parseFloat(transport) || 0) + 
    (parseFloat(loans) || 0) + 
    (parseFloat(otherExpenses) || 0);

  const ndi = (parseFloat(netSalary) || 0) - totalExpenses;

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
        <Text style={styles.title}>NET DISPOSABLE INCOME</Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <Text style={styles.label}>NET SALARY</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={netSalary}
                onChangeText={setNetSalary}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
          <Text style={styles.hint}>*Must match Bank Statement or Payslip</Text>

          <View style={styles.row}>
            <Text style={styles.label}>RENT / BOND</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={rentBond}
                onChangeText={setRentBond}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>FOOD</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={food}
                onChangeText={setFood}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>TRANSPORT/ FUEL</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={transport}
                onChangeText={setTransport}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>LOANS</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={loans}
                onChangeText={setLoans}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>ALL OTHER EXPENSES</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={otherExpenses}
                onChangeText={setOtherExpenses}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>TOTAL EXPENSES</Text>
            <View style={styles.resultWrapper}>
              <Text style={styles.resultText}>N$ {totalExpenses.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.ndiRow}>
            <Text style={styles.ndiLabel}>NET DISPOSABLE INCOME</Text>
            <Text style={styles.ndiValue}>N$ {ndi.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>

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
  form: {
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  inputWrapper: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: 120,
  },
  input: {
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000000',
    textAlign: 'right',
  },
  hint: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 16,
    marginTop: -8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  resultWrapper: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    width: 120,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'right',
  },
  ndiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  ndiLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  ndiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00736e',
  },
  buttonContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  saveButton: {
    backgroundColor: '#0B0B3B',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
