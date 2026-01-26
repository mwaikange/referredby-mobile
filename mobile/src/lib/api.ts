import { supabase } from './supabase';
import { ENV } from './env';

const API_BASE_URL = ENV.API_BASE_URL;

// Phone number formatting (convert to +264 format)
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return `+264${cleaned.substring(1)}`;
  } else if (!cleaned.startsWith('264')) {
    return `+264${cleaned}`;
  } else {
    return `+${cleaned}`;
  }
}

// Currency formatting
export function formatCurrency(amount: number): string {
  return `N$ ${amount.toLocaleString('en-NA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Date formatting
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Status codes
export const MEMBERSHIP_STATUS: Record<string, { label: string; color: string }> = {
  "AA": { label: "Awaiting LS Approval", color: "green" },
  "AP": { label: "Awaiting Community Approval", color: "green" },
  "AP2": { label: "Approved by LS Partner", color: "green" },
  "DE": { label: "Declined", color: "red" },
  "BL": { label: "Blocked", color: "red" },
  "TA": { label: "Total Applications", color: "red" },
  "NR": { label: "No Record", color: "grey" },
};

export const LOAN_STATUS: Record<string, { label: string; color: string }> = {
  "PU": { label: "Paid Up", color: "green" },
  "DU": { label: "Due", color: "green" },
  "AD": { label: "Awaiting Disbursements", color: "blue" },
  "AA": { label: "Awaiting Approval", color: "yellow" },
  "OT": { label: "Outstanding", color: "orange" },
  "NR": { label: "No Record", color: "grey" },
  "BL": { label: "Blocked", color: "red" },
  "DE": { label: "Decline", color: "red" },
};

export function getLoanStatusLabel(status: string): string {
  return LOAN_STATUS[status]?.label || status;
}

export function getMembershipStatusLabel(status: string): string {
  return MEMBERSHIP_STATUS[status]?.label || status;
}

// Referral data type
export type ReferralData = {
  code: string;
  lending_society_id: string;
  lending_society_name: string;
  partner_id: string;
  staff_code: string;
  referral_owner_id: string;
};

// Personal data type
export type PersonalData = {
  full_names: string;
  surname: string;
  id_number: string;
  mobile: string;
  gender: string;
  region: string;
  town: string;
  street_name: string;
  physical_address: string;
  email: string;
};

// Employer data type
export type EmployerData = {
  employer_name: string;
  occupation: string;
  office_number: string;
  employee_code: string;
  nok_name: string;
  nok_surname: string;
  nok_relationship: string;
  nok_mobile: string;
  po_box: string;
  source_funds: string;
  source_income: string;
};

export type UserProfile = {
  id: string;
  uid: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  id_number: string;
  account_uid: string;
  account_name?: string;
  client_id?: string;
  nano_installment: string;
  term_installment: string;
  account_level: string;
  nano_loan_limit?: number | string;
  term_loan_limit?: number | string;
  membership_status?: string;
  credit_rating: number;
  borrower_rating?: number; // 0-10 scale
  star_rating?: number;
  
  // Document status
  documents?: {
    national_id: boolean;
    payslip: boolean;
    kyc: boolean;
  };
  document_deadline?: string;
  is_doc_update_needed?: boolean;
  
  // Loan access control (NEW)
  loan_access?: {
    nano: boolean;
    term: boolean;
    term_max_months?: number;
    term_min_months?: number;
  };
  nano_loan_enabled?: boolean;
  term_loan_enabled?: boolean;
  
  // Legacy fields
  kyc_status?: {
    id: boolean;
    proof_of_income: boolean;
    kyc: boolean;
  };
  documents_update_due?: string;
};

export type InterestConfirmation = {
  // Header info
  referring_partner: string;
  lender: string;
  portfolio_holder?: string;
  lending_society: string;
  borrower?: string;
  
  // Mode info
  active_interest_mode?: string;
  rate_basis?: string; // 'PIR+SIR' or 'IIR'
  
  // PIR (for nano loans)
  pir_percent?: number;
  
  // IIR (for term loans)
  iir_enabled?: boolean;
  iir_base?: number; // Term Loan Base Rate
  iir_rates?: {
    fair: number;
    good: number;
    excellent: number;
  };
  
  // SIR (for nano loans)
  sir_enabled?: boolean;
  sir_percent?: number;
  sir_policy?: string;
  
  // Fees
  fees?: {
    processing: number;
    late_fee: number;
  };
  
  // Progression levels
  progression_levels?: {
    nano: { L1: number; L2: number; L3: number };
    term: { L1: number; L2: number; L3: number };
  };
  
  // User's applicable rate
  user_star_rating?: number;
  user_tier_label?: string;
  user_effective_rate?: number;
  
  // Proceed button control (NEW)
  can_proceed?: boolean;
  has_active_loan?: boolean;
};

const getHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('No active session');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const api = {
  // ============== AUTHENTICATION ==============
  auth: {
    login: async (email: string, pin: string) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid email or PIN');
      return data;
    },
    
    sendOtp: async (mobile: string, type: 'registration' | 'password_reset' | 'loan_signature') => {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: formatPhoneNumber(mobile), type }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
      return data;
    },
    
    verifyOtp: async (mobile: string, otp: string, type: 'registration' | 'password_reset' | 'loan_signature') => {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: formatPhoneNumber(mobile), otp, type }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid or expired OTP');
      return data;
    },
    
    resetPassword: async (mobile: string, newPin: string) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: formatPhoneNumber(mobile), newPin }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset PIN');
      return data;
    },
    
    signup: async (signupData: {
      referral: ReferralData;
      personal: PersonalData;
      employer: EmployerData;
      pin: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...signupData,
          personal: {
            ...signupData.personal,
            mobile: formatPhoneNumber(signupData.personal.mobile),
          },
          employer: {
            ...signupData.employer,
            nok_mobile: formatPhoneNumber(signupData.employer.nok_mobile),
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Account creation failed');
      return data;
    },
    
    checkUniqueness: async (id_number: string, mobile: string, email: string) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-uniqueness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number, mobile: formatPhoneNumber(mobile), email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Validation check failed');
      return data;
    },
  },

  // ============== REFERRALS ==============
  referrals: {
    validate: async (code: string): Promise<ReferralData & { valid: boolean }> => {
      const response = await fetch(`${API_BASE_URL}/api/referrals/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok || !data.valid) {
        throw new Error(data.error || 'Invalid or expired referral code');
      }
      return data;
    },
  },

  // ============== UPLOADS (using form data) ==============
  upload: {
    selfie: async (userId: string, fileUri: string, fileName: string) => {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: 'image/jpeg',
      } as any);
      formData.append('userId', userId);
      
      const response = await fetch(`${API_BASE_URL}/api/upload/selfie`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      return data;
    },
    
    documents: async (userId: string, nationalIdUri: string, payslipUri: string) => {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('national_id', {
        uri: nationalIdUri,
        name: 'national_id.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('payslip', {
        uri: payslipUri,
        name: 'payslip.jpg',
        type: 'image/jpeg',
      } as any);
      
      const response = await fetch(`${API_BASE_URL}/api/upload/documents`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      return data;
    },
  },

  // ============== USERS ==============
  users: {
    updateDocuments: async (userId: string, urls: { national_id_url?: string; payslip_url?: string }) => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/documents`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(urls),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Update failed');
      return data;
    },
  },

  // ============== LOANS ==============
  loans: {
    getNanoLoanDetails: async (userId: string): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/loans/nano/details`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        return {
          account_level: 'NL1',
          loan_max: 1800,
          min_amount: 300,
          max_amount: 1800,
          interest_percent: 28.00,
          processing_fee: 32,
        };
      }
      const data = await response.json();
      return data.details || data;
    },

    applyNanoLoan: async (params: { amount: number; interest: number; processing_fee: number; total_repayable: number }): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/loans/nano/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Loan application failed');
      return data;
    },

    getTermLoanDetails: async (userId: string): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/loans/term/details`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        return {
          account_level: 'TL1',
          installment_max: 13000,
          min_amount: 5000,
          max_amount: 13000,
          min_months: 6,
          max_months: 12,
          interest_percent: 27.90,
          processing_fee: 32,
        };
      }
      const data = await response.json();
      return data.details || data;
    },

    applyTermLoan: async (params: { amount: number; months: number; interest: number; processing_fee: number; total_repayable: number; installment_amount: number }): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/loans/term/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Loan application failed');
      return data;
    },

    getActiveLoans: async (userId: string): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mobile/active-loans?user_id=${userId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        return { nano_loans: [], term_loans: [] };
      }
      const data = await response.json();
      return data;
    },

    getPaymentHistory: async (userId: string): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mobile/payment-history?user_id=${userId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        return { payments: [] };
      }
      const data = await response.json();
      return data;
    },

    getLoanHistory: async (userId: string): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mobile/loan-history?user_id=${userId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        return { loans: [] };
      }
      const data = await response.json();
      return data;
    },

    getNanoLoanStatement: async (userId: string): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mobile/nano-loan-statement?user_id=${userId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        return { success: false, error: 'No nano loans found' };
      }
      const data = await response.json();
      return data;
    },

    getTermLoanStatement: async (userId: string): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mobile/term-loan-statement?user_id=${userId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        return { success: false, error: 'No term loans found' };
      }
      const data = await response.json();
      return data;
    },

    getPaymentHistoryByType: async (userId: string, loanType?: 'nano' | 'term'): Promise<any> => {
      const headers = await getHeaders();
      // loan_type is now optional - API fetches all payments when not provided
      let url = `${API_BASE_URL}/api/mobile/payment-history?user_id=${userId}`;
      if (loanType) {
        url += `&loan_type=${loanType}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        return { payments: [] };
      }
      const data = await response.json();
      return data;
    },

    getPaymentHistoryByLoanId: async (userId: string, loanId: string): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mobile/payment-history?user_id=${userId}&loan_id=${loanId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        return { payments: [] };
      }
      const data = await response.json();
      return data;
    },

    getStatement: async (userId: string): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mobile/statement?user_id=${userId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        return { success: false, error: 'No statement found' };
      }
      const data = await response.json();
      return data;
    },

    getCreditRating: async (userId: string): Promise<any> => {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mobile/credit-rating?user_id=${userId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        return { success: false, rating: 0, score: 0, label: 'NO RECORD' };
      }
      const data = await response.json();
      return data;
    },
  },

  // ============== PROFILE ==============
  getProfile: async (): Promise<UserProfile> => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error('No active session');

    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Profile fetch failed:', errorText);
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    const userProfile = data.user || data;

    if (userProfile.borrower_rating) {
      userProfile.borrower_rating = Number(userProfile.borrower_rating);
    }
    
    // Polyfill documents if using legacy kyc_status
    if (!userProfile.documents && userProfile.kyc_status) {
      userProfile.documents = {
        national_id: userProfile.kyc_status.id || false,
        payslip: userProfile.kyc_status.proof_of_income || false,
        kyc: userProfile.kyc_status.kyc || false,
      };
    }

    return userProfile as UserProfile;
  },

  // Updated: Now uses GET with type parameter
  getInterestConfirmation: async (
    userId: string,
    loanType: 'nano' | 'term' = 'nano'
  ): Promise<InterestConfirmation> => {
    const headers = await getHeaders();
    
    // Try GET first (new API), fallback to POST (legacy)
    let response = await fetch(
      `${API_BASE_URL}/api/mobile/interest-confirmation?type=${loanType}`,
      { method: 'GET', headers }
    );

    // Fallback to POST if GET returns 404 or 405
    if (response.status === 404 || response.status === 405) {
      response = await fetch(`${API_BASE_URL}/api/mobile/interest-confirmation`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_id: userId, loan_amount: 2000, type: loanType }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Interest API Error:', errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.confirmation || data;
  },
};
