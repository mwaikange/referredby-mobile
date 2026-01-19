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
  
  // Supabase specific fields
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
  lender: string;
  lending_society: string;
  borrower: string;
  rate_mode: string;
  portfolio_interest_rate: string;
  individual_interest_rate: {
    "0-3_stars_fair": string;
    "4-6_stars_good": string;
    "7-10_stars_excellent": string;
  };
  subsidized_interest_rate: {
    subsidy_enabled: boolean;
    rate: string;
    policy: string;
  };
  fees: {
    processing_fee: string;
    late_fee: string;
  };
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
