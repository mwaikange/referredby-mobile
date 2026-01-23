import { supabase } from "./supabase";
import { ENV } from "./env";

// API Base URL from centralized config
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
  
  // Display fields
  nano_installment: string;
  term_installment: string;
  account_level: string;
  
  // API fields
  account_name?: string;
  client_id?: string;
  is_doc_update_needed?: boolean;
  document_deadline?: string;
  documents?: {
    national_id: boolean;
    payslip: boolean;
    kyc: boolean;
  };
  
  // Loan limits
  nano_loan_limit?: number | string;
  term_loan_limit?: number | string;
  membership_status?: string;

  // Credit rating (0-10 scale)
  credit_rating: number;
  borrower_rating?: number;
  star_rating?: number;
  
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
  kyc_status: {
    id: boolean;
    proof_of_income: boolean;
    kyc: boolean;
  };
  documents_update_due: string;
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
  rate_basis?: string; // 'PIR+SIR' for nano, 'IIR' for term

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

// Helper to get headers with auth token
const getHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  
  if (!token) {
    throw new Error("No active session");
  }

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const api = {
  // Login is handled via Supabase Auth directly in the component, 
  // but we can add a wrapper if needed. For now we use supabase.auth.signInWithPassword

  // Get Logged-in User Profile
  getProfile: async (): Promise<UserProfile> => {
    // Check local session first
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      throw new Error("No active session");
    }

    console.log('📥 Fetching profile from API...');
    
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "GET",
      headers,
    });

    console.log('📡 Profile response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Profile fetch failed:', errorText);
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    
    // The API might return { success: true, user: ... } or just the user object directly.
    // Based on the prompt log: "Name:", profileData.first_name
    // It seems to return the user object directly or as data.user if wrapped.
    // Let's assume the API returns the user object directly based on "const profileData = await profileResponse.json();" in the prompt.
    // Wait, the prompt code says:
    // const profileData = await profileResponse.json();
    // console.log('👤 Name:', profileData.first_name...);
    // So it seems it returns the user object directly at the root level?
    // Let's check the previous `getProfile` implementation which expected { success: true, user: ... }.
    // The prompt shows: "const profileData = await profileResponse.json();" then accessing properties on profileData.
    // I will try to handle both or assume standard API response. 
    // If previous was wrapper, this might be wrapper too. But the prompt implies direct access.
    // Safest bet: Check if 'user' property exists, else use data itself.
    
    const userProfile = data.user || data;

    console.log('✅ Profile loaded from API!', userProfile);

    // Ensure numeric values are numbers if they come as strings
    if (userProfile.borrower_rating) {
        userProfile.borrower_rating = Number(userProfile.borrower_rating);
    }
    
    // Polyfill kyc_status if missing
    if (!userProfile.kyc_status) {
        userProfile.kyc_status = {
          id: false,
          proof_of_income: false,
          kyc: false
        };
    }

    return userProfile as UserProfile;
  },

  // Get Interest Confirmation Details
  // Updated: Now uses GET with type parameter, fallback to POST for legacy
  getInterestConfirmation: async (
    userId: string,
    loanType: 'nano' | 'term' = 'nano',
    loanAmount: number = 2000
  ): Promise<InterestConfirmation> => {
    const headers = await getHeaders();
    console.log('📥 Fetching interest confirmation from API...', { userId, loanType, loanAmount });

    // Try GET first (new API), fallback to POST (legacy)
    let response = await fetch(
      `${API_BASE_URL}/api/mobile/interest-confirmation?type=${loanType}`,
      { method: "GET", headers }
    );

    // Fallback to POST if GET returns 404 or 405
    if (response.status === 404 || response.status === 405) {
      console.log('📡 GET not supported, falling back to POST...');
      response = await fetch(`${API_BASE_URL}/api/mobile/interest-confirmation`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          user_id: userId,
          loan_amount: loanAmount,
          type: loanType,
        }),
      });
    }

    console.log('📡 Interest API Response Status:', response.status);

    if (!response.ok) {
       const errorText = await response.text();
       console.error('❌ Interest API Error:', errorText);
       throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Interest data received:', data);
    
    return data.confirmation || data;
  }
};
