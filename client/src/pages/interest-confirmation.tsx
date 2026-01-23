import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api, type InterestConfirmation } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function InterestConfirmationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [data, setData] = useState<InterestConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profile = await api.getProfile();
      
      console.log('📥 Fetching interest confirmation...', { 
        userId: profile.id, 
        loanType: 'nano' 
      });

      const confirmation = await api.getInterestConfirmation(profile.id, 'nano');
      setData(confirmation);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load interest details",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProceed = () => {
    if (data?.has_active_loan) {
      toast({
        variant: "destructive",
        title: "Active Loan",
        description: "You have an active loan. Please settle it before applying for a new one.",
      });
      return;
    }
    setLocation("/nano-loan-apply");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center font-sans min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          <p className="mt-4 text-sm text-gray-500">Loading details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-6 tracking-tight text-[20px]">
          INTEREST CONFIRMATION
        </h1>

        {/* Green Info Card */}
        <div className="bg-[#00736e] text-white p-4 rounded-lg mb-4 shadow-md">
          <div className="grid grid-cols-[140px_1fr] gap-y-2 text-sm leading-tight">
            <div className="font-bold opacity-90">Referring Partner:</div>
            <div className="font-medium">{data?.referring_partner || "..."}</div>
            <div className="font-bold opacity-90">Lender:</div>
            <div className="font-medium">{data?.lender || "..."}</div>
            <div className="font-bold opacity-90">Lending Society:</div>
            <div className="font-medium">{data?.lending_society || "..."}</div>
            <div className="font-bold opacity-90">Borrower:</div>
            <div className="font-medium">{data?.borrower || "..."}</div> 
          </div>
        </div>

        {/* Active Interest Mode Badge */}
        <div className="mb-6">
          <div className="bg-[#eff6ff] text-[#1e3a8a] px-4 py-3 rounded-lg text-sm font-bold border border-[#bfdbfe] w-full text-center shadow-sm">
            Active Interest Mode: {data?.active_interest_mode || data?.rate_basis || "PIR (Base Rate)"}
          </div>
        </div>

        {/* PIR Section */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-1">Portfolio Interest Rate (PIR)</h2>
          <p className="text-sm text-gray-600">Base Rate: <span className="font-bold text-black">{data?.pir_percent ? `${data.pir_percent}%` : "28.00%"}</span></p>
        </div>

        {/* SIR Section */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-1">Subsidized Interest Rate (SIR)</h2>
          <p className="text-sm text-gray-400">Subsidy: {data?.sir_enabled ? `${data?.sir_percent}%` : "Not Applied"}</p>
        </div>

        {/* Fees Section */}
        <div className="mb-4">
          <h2 className="text-sm font-bold mb-3">Fees</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee:</span>
              <span className="font-bold text-[#00736e]">N$ {data?.fees?.processing || "32.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Late Fee (Accumulating Arrears):</span>
              <span className="font-bold text-[#00736e]">{data?.fees?.late_fee ? `${data.fees.late_fee}%` : "6%"}</span>
            </div>
          </div>
        </div>

        {/* Nano Loan Limits */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3">Nano Loan Limits</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Level 1:</span>
              <span className="font-bold text-[#00736e]">N$ {data?.progression_levels?.nano?.L1?.toLocaleString() || "1800.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Level 2:</span>
              <span className="font-bold text-[#00736e]">N$ {data?.progression_levels?.nano?.L2?.toLocaleString() || "3200.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Level 3:</span>
              <span className="font-bold text-[#00736e]">N$ {data?.progression_levels?.nano?.L3?.toLocaleString() || "8500.00"}</span>
            </div>
          </div>
        </div>

        {/* Applicable Rate Card (Yellow) */}
        <div className="bg-[#FEF3C7] p-5 rounded-lg border border-[#fef3c7] mb-8 shadow-sm">
          <h2 className="text-base font-bold mb-4">Your Applicable Rate</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Your Rating:</span>
              <span className="font-bold">{data?.user_star_rating || "0.5"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Your Tier:</span>
              <span className="font-bold">{data?.user_tier_label || "Fair (0-3)"}</span>
            </div>
          </div>
          
          <div className="h-px bg-[#fcd34d] w-full mb-4 opacity-50" />
          
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Interest Basis:</span>
              <span className="font-bold">{data?.rate_basis || "PIR"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subsidy Status:</span>
              <span className="font-bold">{data?.sir_enabled ? "Applied" : "None"}</span>
            </div>
          </div>
          
          <div className="h-px bg-[#fcd34d] w-full mb-4 opacity-50" />
          
          <div className="flex justify-between items-end">
            <div className="text-sm leading-tight">
              <span className="font-bold block">Your Final Interest Rate:</span>
              <span className="text-[10px] text-gray-500 font-medium">(PIR)</span>
            </div>
            <div className="text-3xl font-bold text-[#00736e]">{data?.user_effective_rate ? `${data.user_effective_rate.toFixed(2)}%` : "28.00%"}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4 pb-6">
          <Button 
            className={`w-full font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg ${
              data?.can_proceed !== false && !data?.has_active_loan
                ? 'bg-[#0B0B3B] hover:bg-[#151555] text-white'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            onClick={handleProceed}
            disabled={data?.can_proceed === false || data?.has_active_loan}
          >
            {data?.has_active_loan ? 'Active Loan Exists' : 'Proceed'}
          </Button>
          <Button 
            onClick={() => setLocation("/profile")}
            className="w-full bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
