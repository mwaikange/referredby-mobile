import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api, type InterestConfirmation } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function TermInterestConfirmationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [data, setData] = useState<InterestConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        const confirmation = await api.getInterestConfirmation(profile.id, 'term');
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
    toast({
      title: "Success",
      description: "Your term loan request has been submitted.",
    });
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

        <div className="bg-[#00736e] text-white p-4 rounded-lg mb-4 shadow-md">
          <div className="grid grid-cols-[120px_1fr] gap-y-2 text-xs leading-tight">
            <div className="font-bold opacity-90">Referring Partner:</div>
            <div>{data?.referring_partner || "naatye peno"}</div>
            <div className="font-bold opacity-90">Lender:</div>
            <div>{data?.lender || "Destiny Group Pty LTD"}</div>
            <div className="font-bold opacity-90">Lending Society:</div>
            <div>{data?.lending_society || "kayia Industries"}</div>
            <div className="font-bold opacity-90">Borrower:</div>
            <div>{data?.borrower || "OAKAFOR JOHN"}</div>
          </div>
        </div>

        <div className="bg-[#eff6ff] text-[#1e3a8a] px-4 py-3 rounded-lg text-sm border border-[#bfdbfe] mb-6 text-center">
          Active Interest Mode: IIR (Rating-Based)
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold mb-1">Term Loan Base Rate</h2>
          <p className="text-sm">Base Rate: <span className="font-bold">{data?.iir_base || "27.90"}%</span></p>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold mb-2">Individual Interest Rate (IIR)</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">0-3 Stars (Fair):</span>
              <span className="font-bold">{data?.iir_rates?.fair || "27.90"}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">4-6 Stars (Good):</span>
              <span className="font-bold">{data?.iir_rates?.good || "18.00"}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">7-10 Stars (Excellent):</span>
              <span className="font-bold">{data?.iir_rates?.excellent || "12.45"}%</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold mb-2">Fees</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Processing Fee:</span>
              <span className="font-bold">N$ {data?.fees?.processing || "32.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Late Fee (Accumulating Arrears):</span>
              <span className="font-bold">{data?.fees?.late_fee || "6"}%</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold mb-2">Term Loan Limits</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Level 1:</span>
              <span className="font-bold">N$ 13000.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Level 2:</span>
              <span className="font-bold">N$ 15000.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Level 3:</span>
              <span className="font-bold">N$ 20000.00</span>
            </div>
          </div>
        </div>

        <div className="bg-[#FEF3C7] p-5 rounded-lg mb-10">
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
          
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Interest Basis:</span>
              <span className="font-bold uppercase text-xs">IIR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subsidy Status:</span>
              <span className="font-bold">None</span>
            </div>
          </div>
          
          <div className="h-px bg-[#fcd34d] w-full mb-4 opacity-50" />
          
          <div className="flex justify-between items-end">
            <div className="text-sm leading-tight">
              <span className="font-bold block">Your Final Interest Rate:</span>
              <span className="text-[10px] text-gray-500">(IIR)</span>
            </div>
            <div className="text-3xl font-bold text-[#00736e]">
              {data?.user_effective_rate ? `${data.user_effective_rate.toFixed(2)}%` : "27.90%"}
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-10">
          <Button 
            onClick={handleProceed}
            className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            Proceed
          </Button>
          <Button 
            onClick={() => setLocation("/term-loans")}
            className="w-full bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
