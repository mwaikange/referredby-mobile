import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Bell } from "lucide-react";
import { api, type UserProfile } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        console.log("📄 Profile Page - User Data:", data);
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/login");
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 10; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">☆</span>);
      }
    }
    return stars;
  };

  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center font-sans min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          <p className="mt-4 text-sm text-gray-500">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  const rating = profile?.star_rating || profile?.credit_rating || 0;
  const nanoInstallment = profile?.nano_installment || `MAX | NAD ${profile?.nano_loan_limit || 0}`;
  const termInstallment = profile?.term_installment || `MAX | NAD ${profile?.term_loan_limit || 0}`;
  const accountLevel = profile?.account_level || 'NL1 / TL0';

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold uppercase tracking-tight">PROFILE</h1>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-red-500" />
            <Settings className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Account Name</span>
            <span className="text-sm font-medium">{profile?.first_name?.trim()} {profile?.last_name?.trim()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Client ID</span>
            <span className="text-sm font-medium">{profile?.id_number}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Account UID</span>
            <span className="text-sm font-medium">{profile?.uid}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Nano Installment</span>
            <span className="text-sm font-medium">{nanoInstallment}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Term Installment</span>
            <span className="text-sm font-medium">{termInstallment}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Account Level</span>
            <span className="text-sm font-medium">{accountLevel}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">Credit Rating</span>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-lg">🏆</span>
              {renderStars(rating)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">ID</span>
            <span className={`w-3 h-3 rounded-full ${profile?.documents?.national_id ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Proof of Income</span>
            <span className={`w-3 h-3 rounded-full ${profile?.documents?.payslip ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">KYC</span>
            <span className={`w-3 h-3 rounded-full ${profile?.documents?.kyc ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
          <Settings className="w-4 h-4 text-gray-400 ml-auto" />
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Documents need to update on: {formatDeadline(profile?.document_deadline) || profile?.documents_update_due || 'Not available'}
        </p>

        <Button 
          variant="outline"
          className={`w-full h-[48px] font-bold uppercase tracking-wide rounded-lg mb-8 ${
            profile?.is_doc_update_needed 
              ? 'border-[#00736e] text-[#00736e] hover:bg-[#00736e]/10' 
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!profile?.is_doc_update_needed}
        >
          UPDATE DOCUMENTS
        </Button>

        <div className="space-y-4">
          <Button 
            onClick={() => setLocation("/interest-confirmation")}
            className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            Request Nano Loan
          </Button>
          <Button 
            onClick={() => setLocation("/term-loans")}
            className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg">
            Apply for Term Loan
          </Button>
          <Button 
            onClick={() => setLocation("/statement")}
            className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            Statement
          </Button>
          <Button 
            onClick={() => setLocation("/credit-score-history")}
            className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            Credit Score History
          </Button>

          <Button 
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}
