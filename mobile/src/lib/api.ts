import { supabase } from './supabase';
import { ENV } from './env';

const API_BASE_URL = ENV.API_BASE_URL;

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
