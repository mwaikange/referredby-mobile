import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface LoanDetails {
  account_level: string;
  loan_max: number;
  min_amount: number;
  max_amount: number;
  interest_percent: number;
  processing_fee: number;
  due_date: string;
  outstanding_date: string;
  block_date: string;
}

export default function NanoLoanApplyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [amount, setAmount] = useState<number>(300);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await api.getProfile();
        setLoanDetails({
          account_level: "NL1",
          loan_max: 1800,
          min_amount: 300,
          max_amount: 1800,
          interest_percent: 28.00,
          processing_fee: 32,
          due_date: "2026-03-26",
          outstanding_date: "2026-04-26",
          block_date: "2026-05-27",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateLoan = () => {
    if (!loanDetails) return { interest: 0, fee: 0, total: 0 };
    const interest = (amount * loanDetails.interest_percent) / 100;
    const fee = loanDetails.processing_fee;
    const total = amount + interest + fee;
    return { interest, fee, total };
  };

  const { interest, fee, total } = calculateLoan();

  const handleContinue = async () => {
    if (!termsAccepted || !contractAccepted) {
      toast({
        variant: "destructive",
        title: "Required",
        description: "Please accept both the Terms and Conditions and the Digital Contract.",
      });
      return;
    }
    
    setSubmitting(true);
    try {
      toast({
        title: "Loan Application",
        description: "Your loan application has been submitted successfully!",
      });
      setLocation("/profile");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit loan application",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center font-sans min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#00736e]" />
          <p className="mt-4 text-sm text-gray-500">Loading loan details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-4 tracking-tight text-[20px]">
          REQUEST LOAN
        </h1>

        <div className="flex justify-center mb-4">
          <img 
            src="/referredby-logo.png" 
            alt="ReferredBy" 
            className="h-[50px] object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <p className="text-center text-sm mb-2">
          Account Level: <span className="font-bold">{loanDetails?.account_level}</span>
        </p>
        <p className="text-center text-sm font-bold mb-4">
          LOAN MAX : {loanDetails?.loan_max}
        </p>

        <div className="border border-gray-300 rounded-lg p-3 mb-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.min(Math.max(Number(e.target.value), loanDetails?.min_amount || 300), loanDetails?.max_amount || 1800))}
            className="w-full text-center text-lg font-bold outline-none"
            min={loanDetails?.min_amount}
            max={loanDetails?.max_amount}
          />
        </div>
        <p className="text-center text-xs text-gray-500 mb-4">
          Min : NAD {loanDetails?.min_amount} - Max : NAD {loanDetails?.max_amount?.toLocaleString()}
        </p>

        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Interest ( % )</span>
              <span className="font-bold">{loanDetails?.interest_percent?.toFixed(2)} %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest ( NAD )</span>
              <span className="font-bold">{interest.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee ( NAD )</span>
              <span className="font-bold">{fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="font-bold">Total Repayable ( NAD )</span>
              <span className="font-bold">{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date</span>
              <span>{loanDetails?.due_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Outstanding Date</span>
              <span>{loanDetails?.outstanding_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Block Date</span>
              <span>{loanDetails?.block_date}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-xs mb-4">
          <span className="text-gray-600">READ: <a href="#" className="text-[#00736e] underline">Terms & Conditions</a></span>
          <span className="text-gray-600">READ: <a href="#" className="text-[#00736e] underline">Digital Contract</a></span>
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 border-2 border-gray-400 rounded"
            />
            <span className="text-xs text-gray-600">
              I have read and understood the Terms and Conditions
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={contractAccepted}
              onChange={(e) => setContractAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 border-2 border-gray-400 rounded"
            />
            <span className="text-xs text-gray-600">
              I have read the contract and acknowledge that ticking this box and submitting request constitutes to a digital signature and thus a valid contract.
            </span>
          </label>
        </div>

        <div className="space-y-3 pb-6">
          <Button 
            onClick={handleContinue}
            disabled={submitting || !termsAccepted || !contractAccepted}
            className={`w-full font-bold uppercase tracking-wide h-[48px] rounded-lg ${
              termsAccepted && contractAccepted
                ? 'bg-[#00736e]/50 hover:bg-[#00736e] text-white'
                : 'bg-[#00736e]/50 text-white cursor-not-allowed'
            }`}
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CONTINUE'}
          </Button>
          <Button 
            onClick={() => setLocation("/interest-confirmation")}
            className="w-full bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
