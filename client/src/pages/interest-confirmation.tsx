import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { api, type InterestConfirmation } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function InterestConfirmation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [data, setData] = useState<InterestConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // We need user profile first to get ID and Nano Limit
        const profile = await api.getProfile();
        
        // Use user.id and nano_loan_limit (default to 2000 if missing)
        const loanAmount = Number(profile.nano_loan_limit) || 2000;
        
        console.log('📥 Fetching interest confirmation...', { 
          userId: profile.id, 
          loanAmount 
        });

        const confirmation = await api.getInterestConfirmation(profile.id, loanAmount);
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

    fetchData();
  }, [toast]);

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
        <h1 className="text-center font-bold uppercase mb-6 tracking-tight">INTEREST CONFIRMATION</h1>

        {/* Green Info Card */}
        <div className="bg-[#007074] text-white p-4 rounded-lg mb-6 shadow-md">
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
        <div className="flex justify-center mb-6">
          <div className="bg-[#ebf5ff] text-[#3459c0] px-4 py-2 rounded-md text-xs font-bold border border-[#d6eaff] w-full text-center">
            Active Interest Mode: {data?.rate_mode || "..."}
          </div>
        </div>

        {/* PIR Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-1">Portfolio Interest Rate (PIR)</h2>
          <p className="text-sm">Base Rate: <span className="font-bold">{data?.portfolio_interest_rate || "..."}</span></p>
        </div>

        {/* IIR Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3">Individual Interest Rate (IIR)</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>0–3 Stars (Fair):</span>
              <span className="font-bold">{data?.individual_interest_rate["0-3_stars_fair"] || "..."}</span>
            </div>
            <div className="flex justify-between">
              <span>4–6 Stars (Good):</span>
              <span className="font-bold">{data?.individual_interest_rate["4-6_stars_good"] || "..."}</span>
            </div>
            <div className="flex justify-between">
              <span>7–10 Stars (Excellent):</span>
              <span className="font-bold">{data?.individual_interest_rate["7-10_stars_excellent"] || "..."}</span>
            </div>
          </div>
        </div>

        {/* SIR Section */}
        <div className="bg-[#f0fdf4] p-4 rounded-lg border border-[#dcfce7] mb-6">
          <h2 className="text-sm font-bold mb-2">Subsidized Interest Rate (SIR)</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subsidy Enabled:</span>
              <span className="font-bold">{data?.subsidized_interest_rate.rate || "..."}</span>
            </div>
            <p className="text-xs">Policy: <span className="font-bold">{data?.subsidized_interest_rate.policy || "..."}</span></p>
          </div>
        </div>

        {/* Fees Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3">Fees</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Processing Fee:</span>
              <span className="font-bold">{data?.fees.processing_fee || "..."}</span>
            </div>
            <div className="flex justify-between">
              <span>Late Fee (Accumulating Arrears):</span>
              <span className="font-bold">{data?.fees.late_fee || "..."}</span>
            </div>
          </div>
        </div>

        {/* Nano Loan Limits */}
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3">Nano Loan Limits</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Level 1:</span>
              <span className="font-bold">N$ 2000.00</span>
            </div>
            <div className="flex justify-between">
              <span>Level 2:</span>
              <span className="font-bold">N$ 4200.00</span>
            </div>
            <div className="flex justify-between">
              <span>Level 3:</span>
              <span className="font-bold">N$ 8700.00</span>
            </div>
          </div>
        </div>

        {/* Applicable Rate Card (Yellow) */}
        <div className="bg-[#fffbeb] p-5 rounded-lg border border-[#fef3c7] mb-10 shadow-sm">
          <h2 className="text-base font-bold mb-4">Your Applicable Rate</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span>Your Rating:</span>
              <span className="font-bold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Your Tier:</span>
              <span className="font-bold">Fair (0–3)</span>
            </div>
          </div>
          
          <div className="h-px bg-[#fef3c7] w-full mb-4" />
          
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span>Interest Basis:</span>
              <span className="font-bold uppercase text-xs">IIR</span>
            </div>
            <div className="flex justify-between">
              <span>Subsidy Status:</span>
              <span className="font-bold">Applied</span>
            </div>
          </div>
          
          <div className="h-px bg-[#fef3c7] w-full mb-4" />
          
          <div className="flex justify-between items-end">
            <div className="text-sm leading-tight">
              <span className="font-bold block">Your Final Interest Rate:</span>
              <span className="text-[10px] text-gray-400 font-medium">(IIR - SIR)</span>
            </div>
            <div className="text-3xl font-bold text-[#006f3c]">14.05%</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Button 
            className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md"
          >
            Proceed
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
