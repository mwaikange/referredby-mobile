import { supabase } from "./supabase";

// Use a centralized config to handle env vars consistently
// In Vite, process.env is usually empty in the browser, so we use import.meta.env
// The user wants to use EXPO_PUBLIC_* keys, but those are only exposed if configured in vite.config.ts
// Since we can't edit vite.config.ts, we fallback to VITE_* or NEXT_PUBLIC_*

const getEnvVar = (key: string) => {
  // Check standard Vite env vars
  if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
  // Check typical React/Next env vars
  if (import.meta.env[`NEXT_PUBLIC_${key}`]) return import.meta.env[`NEXT_PUBLIC_${key}`];
  // Check if they were somehow exposed as EXPO_PUBLIC (unlikely in default Vite but good for compatibility)
  // @ts-ignore
  if (import.meta.env[`EXPO_PUBLIC_${key}`]) return import.meta.env[`EXPO_PUBLIC_${key}`];
  
  return "";
};

const API_BASE_URL = getEnvVar("API_BASE_URL") || "https://appv2.referredby.com.na";

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
