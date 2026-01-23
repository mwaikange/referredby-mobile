import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function BankAuthorizationScreen() {
  const navigation = useNavigation();

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
        <View style={styles.companyHeader}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>Logo</Text>
          </View>
          <Text style={styles.companyName}>DESTINY GROUP PTY LTD</Text>
          <Text style={styles.companyInfo}>CC Reg: Pty/09/20094</Text>
          <Text style={styles.companyInfo}>Namibia Reg: NPL200_bf</Text>
          <Text style={styles.companyInfo}>info@destinygroup.com.na | +26461200698</Text>
          <Text style={styles.companyInfo}>Erf 567 / Unit 686-A Kolinger Street Windhoek Namibia</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLIENT DETAILS</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Full Name</Text>
            <Text style={styles.detailValue}>OAKAFOR JOHN</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Surname</Text>
            <Text style={styles.detailValue}>JOHN</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID Number</Text>
            <Text style={styles.detailValue}>8629360009</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mobile Number</Text>
            <Text style={styles.detailValue}>+264857384666</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BANKING DETAILS</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bank Name</Text>
            <Text style={styles.detailValue}>Standard Bank Namibia</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Branch Code</Text>
            <Text style={styles.detailValue}>70098</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Branch Town</Text>
            <Text style={styles.detailValue}>Katutura Branch</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Number</Text>
            <Text style={styles.detailValue}>60008292656</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>UPI/PP Address</Text>
            <Text style={styles.detailValue}>@264857384666</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>DOWNLOAD CONSENT PDF</Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Download authorization form:</Text>
          <Text style={styles.instructionItem}>• Sign and upload it with :</Text>
          <Text style={styles.instructionItem}>• Latest Payslip</Text>
          <Text style={styles.instructionItem}>• 3 Months teller printed Bankstatement</Text>
          <Text style={styles.instructionItemRed}>• (stamp not older than 3 days – must reflect all 3 salaries)</Text>
          <Text style={styles.instructionItemRed}>• Maximum 4MB per file</Text>
        </View>

        <View style={styles.uploadSection}>
          <View style={styles.uploadRow}>
            <Text style={styles.uploadLabel}>Bank Account Debit Consent</Text>
            <TouchableOpacity style={styles.chooseFileButton}>
              <Text style={styles.chooseFileText}>CHOOSE FILE</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.uploadRow}>
            <Text style={styles.uploadLabel}>Latest Payslip</Text>
            <TouchableOpacity style={styles.chooseFileButton}>
              <Text style={styles.chooseFileText}>CHOOSE FILE</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.uploadRow}>
            <Text style={styles.uploadLabel}>Bank Statement (3 Months)</Text>
            <TouchableOpacity style={styles.chooseFileButton}>
              <Text style={styles.chooseFileText}>CHOOSE FILE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>SUBMIT</Text>
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
  companyHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#00736e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '500',
  },
  downloadButton: {
    borderWidth: 2,
    borderColor: '#00736e',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  downloadButtonText: {
    color: '#00736e',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  instructions: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  instructionItemRed: {
    fontSize: 11,
    color: '#dc2626',
    marginBottom: 4,
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  uploadLabel: {
    fontSize: 12,
    color: '#000000',
    flex: 1,
  },
  chooseFileButton: {
    backgroundColor: '#00736e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  chooseFileText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  submitButton: {
    backgroundColor: '#0B0B3B',
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
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
