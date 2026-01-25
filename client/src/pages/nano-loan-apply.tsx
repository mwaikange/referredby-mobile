import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/referredby-logo.png";

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
  const [amountStr, setAmountStr] = useState<string>("300");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        const loanInfo = await api.loans.getNanoLoanDetails(profile.id);
        const details = {
          account_level: loanInfo.account_level || "NL1",
          loan_max: loanInfo.loan_max || 1800,
          min_amount: loanInfo.min_amount || 300,
          max_amount: loanInfo.max_amount || 1800,
          interest_percent: loanInfo.interest_percent || 28.00,
          processing_fee: loanInfo.processing_fee || 32,
          due_date: loanInfo.due_date || "2026-03-26",
          outstanding_date: loanInfo.outstanding_date || "2026-04-26",
          block_date: loanInfo.block_date || "2026-05-27",
        };
        setLoanDetails(details);
        setAmountStr(details.min_amount.toString());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const amount = Number(amountStr) || 0;

  const calculateLoan = () => {
    if (!loanDetails) return { interest: 0, fee: 0, total: 0 };
    const interest = (amount * loanDetails.interest_percent) / 100;
    const fee = loanDetails.processing_fee;
    const total = amount + interest + fee;
    return { interest, fee, total };
  };

  const { interest, fee, total } = calculateLoan();

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setAmountStr(cleaned);
  };

  const handleAmountBlur = () => {
    let num = Number(amountStr) || 0;
    if (loanDetails) {
      num = Math.min(Math.max(num, loanDetails.min_amount), loanDetails.max_amount);
    }
    setAmountStr(num.toString());
  };

  const handleContinue = () => {
    if (!termsAccepted || !contractAccepted) {
      toast({
        variant: "destructive",
        title: "Required",
        description: "Please accept both the Terms and Conditions and the Digital Contract.",
      });
      return;
    }
    setShowOtpModal(true);
    setOtp("");
    setOtpError("");
  };

  const handleSubmitOtp = async () => {
    if (!otp.trim()) {
      setOtpError("Please enter OTP");
      return;
    }
    
    setVerifyingOtp(true);
    setOtpError("");
    
    try {
      const profile = await api.getProfile();
      await api.auth.verifyOtp(profile.mobile, otp, 'loan_signature');
      
      await api.loans.applyNanoLoan({
        amount: Number(amountStr),
        interest: interest,
        processing_fee: fee,
        total_repayable: total,
      });
      
      setShowOtpModal(false);
      setShowSuccess(true);
    } catch (error: any) {
      setOtpError(error.message || "Verification failed. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setLocation("/profile");
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
            src={logoImg} 
            alt="ReferredBy" 
            className="h-[50px] object-contain"
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
            type="text"
            inputMode="numeric"
            value={amountStr}
            onChange={(e) => handleAmountChange(e.target.value)}
            onBlur={handleAmountBlur}
            className="w-full text-center text-lg font-bold outline-none"
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
          <span className="text-gray-600">READ: <a href="https://www.referredby.com.na/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-[#00736e] underline">Terms & Conditions</a></span>
          <span className="text-gray-600">READ: <a href="https://www.referredby.com.na/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#00736e] underline">Digital Contract</a></span>
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
                ? 'bg-[#0B0B3B] hover:bg-[#151555] text-white'
                : 'bg-[#0B0B3B]/50 text-white cursor-not-allowed'
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

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 relative">
            <button 
              onClick={() => setShowOtpModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-center font-bold text-lg mb-2">ENTER OTP</h2>
            <p className="text-center text-sm text-gray-600 mb-1">
              An OTP was sent to you via SMS please enter it here.
            </p>
            <p className="text-center text-xs text-gray-500 mb-4">
              OTP serves as a Digital Signature
            </p>

            {otpError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-bold text-gray-800">Verification Failed</p>
                <p className="text-xs text-gray-600">{otpError}</p>
              </div>
            )}

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full border border-gray-300 rounded-lg p-3 text-center mb-4 outline-none focus:border-[#00736e]"
              maxLength={6}
            />

            <Button
              onClick={handleSubmitOtp}
              disabled={verifyingOtp}
              className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase h-[48px] rounded-lg"
            >
              {verifyingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SUBMIT OTP'}
            </Button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="font-bold text-xl mb-2">Request Successful!</h2>
            <p className="text-sm text-gray-600 mb-6">
              Your loan request has been successfully submitted.<br />
              Please wait 30 minutes for feedback or disbursement to your mobile number.
            </p>
            <Button
              onClick={handleCloseSuccess}
              className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase h-[48px] rounded-lg"
            >
              CLOSE
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
}
