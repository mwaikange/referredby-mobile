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

  const [creditRating, setCreditRating] = useState<number>(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        console.log("📄 Profile Page - User Data:", data);
        setProfile(data);
        
        // Fetch credit rating from dedicated endpoint for consistency
        const creditData = await api.loans.getCreditRating(data.id);
        console.log('📊 Credit rating response:', creditData);
        if (creditData?.success && creditData?.rating !== undefined) {
          setCreditRating(creditData.rating);
        } else {
          setCreditRating(data.star_rating || data.credit_rating || 0);
        }
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
    const decimal = rating - fullStars;
    const hasHalfStar = decimal >= 0.25 && decimal < 0.75;
    const roundUp = decimal >= 0.75;
    
    for (let i = 0; i < 10; i++) {
      if (i < fullStars || (i === fullStars && roundUp)) {
        stars.push(<span key={i} style={{ color: '#D4AF37', fontSize: '18px' }}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} style={{ position: 'relative', display: 'inline-block', width: '18px', fontSize: '18px' }}>
            <span style={{ color: '#d1d5db' }}>☆</span>
            <span style={{ position: 'absolute', left: 0, top: 0, width: '50%', overflow: 'hidden', color: '#D4AF37' }}>★</span>
          </span>
        );
      } else {
        stars.push(<span key={i} style={{ color: '#d1d5db', fontSize: '18px' }}>☆</span>);
      }
    }
    return stars;
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

  const rating = creditRating;
  const nanoInstallment = profile?.nano_installment || `MAX | NAD ${profile?.nano_loan_limit || 0}.00`;
  const termInstallment = profile?.term_installment || `MAX | NAD ${profile?.term_loan_limit || 0}.00`;
  const accountLevel = profile?.account_level || 'NL9 / TL0';

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold uppercase tracking-tight">PROFILE</h1>
          <Bell className="w-5 h-5 text-red-500" />
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Account Name</span>
            <span className="text-sm font-medium text-right">{profile?.first_name?.trim()} {profile?.last_name?.trim()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Client ID</span>
            <span className="text-sm font-medium">{profile?.id_number}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Account UID</span>
            <span className="text-sm font-medium">{profile?.uid}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Nano Installment</span>
            <span className="text-sm font-medium">{nanoInstallment}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Term Installment</span>
            <span className="text-sm font-medium">{termInstallment}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Account Level</span>
            <span className="text-sm font-medium">{accountLevel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Credit Rating</span>
            <div className="flex items-center gap-1">
              {renderStars(rating)}
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-300 w-full mb-4" />

        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium">ID</span>
            <span className={`w-4 h-4 rounded-sm ${profile?.documents?.national_id ? 'bg-green-600' : 'bg-red-500'}`}></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium">Proof of Income</span>
            <span className={`w-4 h-4 rounded-sm ${profile?.documents?.payslip ? 'bg-green-600' : 'bg-red-500'}`}></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium">KYC</span>
            <span className={`w-4 h-4 rounded-sm ${profile?.documents?.kyc ? 'bg-green-600' : 'bg-red-500'}`}></span>
          </div>
          <Settings className="w-5 h-5 text-gray-500 ml-auto" />
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Documents need to update on: Not available
        </p>

        <Button 
          variant="outline"
          className="w-full h-[48px] font-bold uppercase tracking-wide rounded-lg mb-4 border-gray-200 text-gray-400 bg-gray-50"
          disabled
        >
          UPDATE DOCUMENTS
        </Button>

        <div className="h-px bg-gray-300 w-full mb-6" />

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
            className="w-full bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}
