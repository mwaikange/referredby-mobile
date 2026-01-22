import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { api, type InterestConfirmation } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function InterestConfirmationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [data, setData] = useState<InterestConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loanType, setLoanType] = useState<'nano' | 'term'>('nano');
  const [userId, setUserId] = useState<string>('');

  const fetchData = async (type: 'nano' | 'term') => {
    try {
      setLoading(true);
      const profile = await api.getProfile();
      setUserId(profile.id);
      
      console.log('📥 Fetching interest confirmation...', { 
        userId: profile.id, 
        loanType: type 
      });

      const confirmation = await api.getInterestConfirmation(profile.id, type);
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
    fetchData(loanType);
  }, [loanType]);

  const handleTypeChange = (type: 'nano' | 'term') => {
    setLoanType(type);
  };

  const handleProceed = () => {
    if (data?.has_active_loan) {
      toast({
        variant: "destructive",
        title: "Active Loan",
        description: "You have an active loan. Please settle it before applying for a new one.",
      });
      return;
    }
    // Navigate to loan application
    toast({
      title: "Proceed",
      description: "Proceeding to loan application...",
    });
  };

  const isNano = loanType === 'nano';
  const isTerm = loanType === 'term';

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
        <h1 className="text-center font-bold uppercase mb-6 tracking-tight text-[20px] whitespace-nowrap overflow-hidden text-ellipsis">
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

        {/* Loan Type Toggle */}
        <div className="flex mb-4 bg-gray-200 rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
              isNano ? 'bg-[#00736e] text-white' : 'text-gray-600'
            }`}
            onClick={() => handleTypeChange('nano')}
          >
            Nano Loan
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
              isTerm ? 'bg-[#00736e] text-white' : 'text-gray-600'
            }`}
            onClick={() => handleTypeChange('term')}
          >
            Term Loan
          </button>
        </div>

        {/* Active Interest Mode Badge */}
        <div className="mb-6">
          <div className="bg-[#eff6ff] text-[#1e3a8a] px-4 py-3 rounded-lg text-sm font-bold border border-[#bfdbfe] w-full text-center shadow-sm">
            Active Interest Mode: {data?.active_interest_mode || data?.rate_basis || "..."}
          </div>
        </div>

        {/* NANO LOANS: PIR + SIR */}
        {isNano && (
          <>
            {/* PIR Section */}
            <div className="mb-6">
              <h2 className="text-sm font-bold mb-1">Portfolio Interest Rate (PIR)</h2>
              <p className="text-sm">Base Rate: <span className="font-bold">{data?.pir_percent ? `${data.pir_percent}%` : "..."}</span></p>
            </div>

            {/* SIR Section */}
            {data?.sir_enabled && (
              <div className="bg-[#f0fdf4] p-4 rounded-lg border border-[#dcfce7] mb-6">
                <h2 className="text-sm font-bold mb-2">Subsidized Interest Rate (SIR)</h2>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subsidy Enabled:</span>
                    <span className="font-bold">Yes ({data?.sir_percent || 0}%)</span>
                  </div>
                  <p className="text-xs">
                    Policy: <span className="font-bold">{data?.sir_policy === 'after_pir' ? 'Applies After PIR' : data?.sir_policy?.replace('_', ' ').toUpperCase() || "..."}</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* TERM LOANS: IIR with tiers */}
        {isTerm && (
          <>
            {/* Term Loan Base Rate */}
            <div className="mb-6">
              <h2 className="text-sm font-bold mb-1">Term Loan Base Rate</h2>
              <p className="text-sm">Base Rate: <span className="font-bold">{data?.iir_base ? `${data.iir_base}%` : "..."}</span></p>
            </div>

            {/* IIR Section */}
            {data?.iir_enabled && (
              <div className="mb-6">
                <h2 className="text-sm font-bold mb-3">Individual Interest Rate (IIR)</h2>
                <p className="text-xs text-gray-500 mb-2">Rating-based rates:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>0–3 Stars (Fair):</span>
                    <span className="font-bold">{data?.iir_rates?.fair ? `${data.iir_rates.fair}%` : "..."}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4–6 Stars (Good):</span>
                    <span className="font-bold">{data?.iir_rates?.good ? `${data.iir_rates.good}%` : "..."}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>7–10 Stars (Excellent):</span>
                    <span className="font-bold">{data?.iir_rates?.excellent ? `${data.iir_rates.excellent}%` : "..."}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Fees Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3">Fees</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Processing Fee:</span>
              <span className="font-bold">N$ {data?.fees?.processing || "..."}</span>
            </div>
            <div className="flex justify-between">
              <span>Late Fee (Accumulating Arrears):</span>
              <span className="font-bold">{data?.fees?.late_fee ? `${data.fees.late_fee}%` : "..."}</span>
            </div>
          </div>
        </div>

        {/* Loan Limits - Show based on loan type */}
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3">{isNano ? 'Nano' : 'Term'} Loan Limits</h2>
          <div className="space-y-2 text-sm">
            {isNano && data?.progression_levels?.nano && (
              <>
                <div className="flex justify-between">
                  <span>Level 1:</span>
                  <span className="font-bold">N$ {data.progression_levels.nano.L1?.toLocaleString() || "2,000"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level 2:</span>
                  <span className="font-bold">N$ {data.progression_levels.nano.L2?.toLocaleString() || "4,200"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level 3:</span>
                  <span className="font-bold">N$ {data.progression_levels.nano.L3?.toLocaleString() || "8,700"}</span>
                </div>
              </>
            )}
            {isTerm && data?.progression_levels?.term && (
              <>
                <div className="flex justify-between">
                  <span>Level 1:</span>
                  <span className="font-bold">N$ {data.progression_levels.term.L1?.toLocaleString() || "13,000"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level 2:</span>
                  <span className="font-bold">N$ {data.progression_levels.term.L2?.toLocaleString() || "15,000"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level 3:</span>
                  <span className="font-bold">N$ {data.progression_levels.term.L3?.toLocaleString() || "20,000"}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Applicable Rate Card (Yellow) */}
        <div className="bg-[#FEF3C7] p-5 rounded-lg border border-[#fef3c7] mb-10 shadow-sm">
          <h2 className="text-base font-bold mb-4">Your Applicable Rate</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span>Your Rating:</span>
              <span className="font-bold">{data?.user_star_rating || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Your Tier:</span>
              <span className="font-bold">{data?.user_tier_label || "Fair (0-3)"}</span>
            </div>
          </div>
          
          <div className="h-px bg-[#fcd34d] w-full mb-4 opacity-50" />
          
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span>Interest Basis:</span>
              <span className="font-bold uppercase text-xs">{data?.rate_basis || "IIR"}</span>
            </div>
            <div className="flex justify-between">
              <span>Subsidy Status:</span>
              <span className="font-bold">{data?.sir_enabled ? "Applied" : "Not Applied"}</span>
            </div>
          </div>
          
          <div className="h-px bg-[#fcd34d] w-full mb-4 opacity-50" />
          
          <div className="flex justify-between items-end">
            <div className="text-sm leading-tight">
              <span className="font-bold block">Your Final Interest Rate:</span>
              <span className="text-[10px] text-gray-500 font-medium">(IIR - SIR)</span>
            </div>
            <div className="text-3xl font-bold text-[#006f3c]">{data?.user_effective_rate ? `${data.user_effective_rate.toFixed(2)}%` : "..."}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Button 
            className={`w-full font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md ${
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
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
