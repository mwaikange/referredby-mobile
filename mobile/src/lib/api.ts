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
  nano_installment: string;
  term_installment: string;
  account_level: string;
  account_name?: string;
  client_id?: string;
  is_doc_update_needed?: boolean;
  document_deadline?: string;
  documents?: {
    national_id: boolean;
    payslip: boolean;
    kyc: boolean;
  };
  nano_loan_limit?: number | string;
  term_loan_limit?: number | string;
  membership_status?: string;
  credit_rating: number;
  borrower_rating?: number;
  kyc_status: {
    id: boolean;
    proof_of_income: boolean;
    kyc: boolean;
  };
  documents_update_due: string;
};

export type InterestConfirmation = {
  referring_partner: string;
  lender: string;
  portfolio_holder?: string;
  lending_society: string;
  borrower?: string;
  active_interest_mode?: string;
  rate_basis?: string;
  pir_percent?: number;
  iir_enabled?: boolean;
  iir_rates?: {
    fair: number;
    good: number;
    excellent: number;
  };
  sir_enabled?: boolean;
  sir_percent?: number;
  sir_policy?: string;
  fees?: {
    processing: number;
    late_fee: number;
  };
  progression_levels?: {
    nano: { L1: number; L2: number; L3: number };
    term: { L1: number; L2: number; L3: number };
  };
  user_star_rating?: number;
  user_tier_label?: string;
  user_effective_rate?: number;
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
    if (!userProfile.kyc_status) {
      userProfile.kyc_status = { id: false, proof_of_income: false, kyc: false };
    }

    return userProfile as UserProfile;
  },

  getInterestConfirmation: async (userId: string, loanAmount: number = 2000): Promise<InterestConfirmation> => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/api/mobile/interest-confirmation`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: userId, loan_amount: loanAmount }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Interest API Error:', errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.confirmation || data;
  },
};
