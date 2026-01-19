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
  
  // Display fields (might be named differently in Supabase vs API)
  nano_installment: string;
  term_installment: string;
  account_level: string;
  
  // New API fields
  account_name?: string;
  client_id?: string;
  is_doc_update_needed?: boolean;
  document_deadline?: string;
  documents?: {
    national_id: boolean;
    payslip: boolean;
    kyc: boolean;
  };
  
  // Supabase specific fields (keeping for compatibility)
  nano_loan_limit?: number | string;
  term_loan_limit?: number | string;
  membership_status?: string;

  credit_rating: number;
  borrower_rating?: number; // New field from API
  kyc_status: {
    id: boolean;
    proof_of_income: boolean;
    kyc: boolean;
  };
  documents_update_due: string;
};

export type InterestConfirmation = {
  referring_partner: string;
  lender: string; // This seems to be mapped to 'portfolio_holder' or 'lender' in response? The log shows 'lender' as the user name, and 'portfolio_holder' as the company.
  // Log: "lender": "DOBSON ANDRE " (User), "portfolio_holder": "Destiny Group Pty LTD"
  // Previous UI showed Lender: data?.portfolio?.full_name.
  // Let's match the JSON response structure exactly.

  portfolio_holder?: string; // "Destiny Group Pty LTD"
  lending_society: string;
  borrower?: string; // The API returns "lender" as the borrower name? "lender": "DOBSON ANDRE" (User is Dobson Andre)
  // Wait, "lender" in the JSON seems to be the borrower's name if Dobson Andre is the user.
  // The log shows: "first_name":"DOBSON ","last_name":"ANDRE " for the user.
  // So "lender" in the JSON is actually the borrower?? That's confusing naming from backend.
  // But let's trust the keys in the JSON for now.

  rate_basis?: string; // "IIR + SIR"
  pir_percent?: number; // 28

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
    nano: {
      L1: number;
      L2: number;
      L3: number;
    };
    term: {
      L1: number;
      L2: number;
      L3: number;
    };
  };

  user_star_rating?: number;
  user_tier_label?: string;
  user_effective_rate?: number;
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
  getInterestConfirmation: async (userId: string, loanAmount: number = 2000): Promise<InterestConfirmation> => {
    const headers = await getHeaders();
    console.log('📥 Fetching interest confirmation from API...', { userId, loanAmount });

    const response = await fetch(`${API_BASE_URL}/api/mobile/interest-confirmation`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_id: userId,
        loan_amount: loanAmount,
      }),
    });

    console.log('📡 Interest API Response Status:', response.status);

    if (!response.ok) {
       const errorText = await response.text();
       console.error('❌ Interest API Error:', errorText);
       throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Interest data received:', data);
    
    // Check if wrapped in success/confirmation or direct
    // Previous code: return data.confirmation;
    // Prompt code: setData(apiData); (direct?)
    // Prompt log: console.log('✅ Interest data received:', apiData);
    // Prompt usage: data.referring_partner
    // So it seems direct or wrapped?
    // Previous getInterestConfirmation returned data.confirmation.
    // Prompt uses apiData.referring_partner.
    // I will return data.confirmation || data;
    return data.confirmation || data;
  }
};
