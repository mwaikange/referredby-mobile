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
  nano_installment: string;
  term_installment: string;
  account_level: string;
  credit_rating: number;
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

    // Attempt to fetch from Supabase directly first (more reliable if API is down)
    const { data: userData, error: supabaseError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', sessionData.session.user.id)
      .single();

    if (!supabaseError && userData) {
      return userData as unknown as UserProfile;
    }

    // Fallback to API if Supabase fetch fails (or if logic prefers API)
    console.warn("Falling back to API for profile fetch...");
    
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch profile");
    }

    return data.user;
  },

  // Get Interest Confirmation Details
  getInterestConfirmation: async (type: "nano" | "term" = "nano"): Promise<InterestConfirmation> => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/api/loans/interest-confirmation?type=${type}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch interest confirmation: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to fetch interest confirmation");
    }

    return data.confirmation;
  }
};
