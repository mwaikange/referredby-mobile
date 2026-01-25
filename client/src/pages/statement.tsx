import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api, type UserProfile } from "@/lib/api";

interface ActiveLoan {
  id: string;
  reference: string;
  type: 'nano' | 'term';
  status: string;
  received: number;
  interest_percent: number;
  interest_amount: number;
  processing_fee: number;
  total_repayable: number;
  instalment_amount?: number;
  due_date: string;
  outstanding_date: string;
  grace_date: string;
}

export default function Statement() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
  const [loanType, setLoanType] = useState<'nano' | 'term'>('nano');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await api.getProfile();
        setProfile(userProfile);
        
        console.log('📥 Fetching active loans for user:', userProfile.id);
        
        // Fetch active loans from API for the current user
        const activeLoans = await api.loans.getActiveLoans(userProfile.id);
        console.log('📡 Active loans response:', activeLoans);
        
        // Check if user has term loans first, then nano loans
        const termLoans = activeLoans.term_loans || [];
        const nanoLoans = activeLoans.nano_loans || [];
        
        if (termLoans.length > 0) {
          const loan = termLoans[0];
          setLoanType('term');
          setActiveLoan({
            id: loan.id || '',
            reference: loan.reference || loan.loan_id || '',
            type: 'term',
            status: loan.status || 'Due',
            received: loan.received || loan.amount || 0,
            interest_percent: loan.interest_percent || loan.interest_rate || 0,
            interest_amount: loan.interest_amount || loan.interest || 0,
            processing_fee: loan.processing_fee || 0,
            total_repayable: loan.total_repayable || loan.total || 0,
            instalment_amount: loan.instalment_amount || loan.installment_amount,
            due_date: loan.due_date || '',
            outstanding_date: loan.outstanding_date || '',
            grace_date: loan.grace_date || '',
          });
        } else if (nanoLoans.length > 0) {
          const loan = nanoLoans[0];
          setLoanType('nano');
          setActiveLoan({
            id: loan.id || '',
            reference: loan.reference || loan.loan_id || '',
            type: 'nano',
            status: loan.status || 'Due',
            received: loan.received || loan.amount || 0,
            interest_percent: loan.interest_percent || loan.interest_rate || 0,
            interest_amount: loan.interest_amount || loan.interest || 0,
            processing_fee: loan.processing_fee || 0,
            total_repayable: loan.total_repayable || loan.total || 0,
            due_date: loan.due_date || '',
            outstanding_date: loan.outstanding_date || '',
            grace_date: loan.grace_date || '',
          });
        } else {
          // No active loans - show empty state
          setActiveLoan(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center font-sans min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#00736e]" />
          <p className="mt-4 text-sm text-gray-500">Loading statement...</p>
        </div>
      </Layout>
    );
  }

  const loan = activeLoan;
  const isPaidUp = loan?.status?.toLowerCase() === 'paid' || loan?.status?.toLowerCase() === 'paid up';

  // Show empty state when no active loans
  if (!activeLoan) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col font-sans">
          <h1 className="text-center font-bold uppercase mb-2 tracking-tight text-[20px]">
            ACTIVE STATEMENT
          </h1>
          
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">No Active Loans</h2>
            <p className="text-sm text-gray-500 text-center px-8 mb-6">
              You don't have any active loans at the moment. Apply for a loan to get started.
            </p>
            <div className="space-y-3 w-full px-4">
              <Button 
                onClick={() => setLocation("/nano-loan-apply")}
                className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
              >
                Apply for Nano Loan
              </Button>
              <Button 
                onClick={() => setLocation("/term-loan-apply")}
                className="w-full bg-[#0B0B3B] hover:bg-[#0B0B3B]/90 text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
              >
                Apply for Term Loan
              </Button>
              <Button 
                onClick={() => setLocation("/profile")}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 font-bold uppercase tracking-wide h-[48px] rounded-lg"
              >
                Back to Profile
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loanType === 'term') {
    return (
      <Layout>
        <div className="flex-1 flex flex-col font-sans">
          <h1 className="text-center font-bold uppercase mb-2 tracking-tight text-[20px]">
            TERM LOAN STATEMENT
          </h1>
          <p className="text-center text-sm mb-4">
            LOAN TYPE: <span className="text-[#00736e] font-bold">TERM LOAN</span>
          </p>
          <p className="text-sm mb-6">
            LOAN REFERENCE: <span className="font-bold">{loan?.reference}</span>{" "}
            <span className={isPaidUp ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
              {isPaidUp ? "Paid Up" : "Due"}
            </span>
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Received (NAD)</span>
                <span className="font-bold">{loan?.received?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest (%)</span>
                <span className="font-bold">{loan?.interest_percent?.toFixed(2)} %</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest (NAD)</span>
                <span className="font-bold">{loan?.interest_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee (NAD)</span>
                <span className="font-bold">{loan?.processing_fee?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="font-bold">Total Repayable (NAD)</span>
                <span className="font-bold">{loan?.total_repayable?.toFixed(2)}</span>
              </div>
              {loan?.instalment_amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Instalment Amount (NAD)</span>
                  <span className="font-bold">{loan?.instalment_amount?.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date :</span>
              <span>{loan?.due_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Outstanding Date :</span>
              <span>{loan?.outstanding_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Grace Date :</span>
              <span>{loan?.grace_date}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Make a payment via the methods listed below then upload the proof of payment to our online agents by clicking here:
          </p>

          <div className="h-px bg-gray-300 w-3/4 mx-auto mb-6" />

          <div className="space-y-3 mb-6">
            <Button 
              onClick={() => setLocation("/payment-record")}
              className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
            >
              Payment Record
            </Button>
            <Button className="w-full bg-[#00736e]/50 text-white font-bold uppercase tracking-wide h-[48px] rounded-lg cursor-not-allowed" disabled>
              PAY VIA PAYPULSE APP (COMING SOON)
            </Button>
            <Button className="w-full bg-[#00736e]/50 text-white font-bold uppercase tracking-wide h-[48px] rounded-lg cursor-not-allowed" disabled>
              NEW PAYMENT METHOD COMING SOON
            </Button>
          </div>

          <div className="text-center text-xs text-gray-600 space-y-1 mb-8">
            <p>Acc Name: <span className="font-medium">Destiny Group Pty LTD</span></p>
            <p>Bank: <span className="font-medium">Nedbank Namibia</span></p>
            <p>Acc no: <span className="font-medium">6000238099</span></p>
            <p>Account type: <span className="font-medium">Cheque</span></p>
            <p>Branch: <span className="font-medium">Corporate Branch</span></p>
            <p>Branch Code: <span className="font-medium">280173</span></p>
          </div>

          <div className="flex gap-4 pb-6">
            <Button 
              onClick={() => setLocation("/loan-history")}
              className="flex-1 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
            >
              History
            </Button>
            <Button 
              onClick={() => setLocation("/profile")}
              className="flex-1 bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
            >
              BACK
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Nano Loan Statement
  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-2 tracking-tight text-[20px]">
          NANO LOAN STATEMENT
        </h1>
        <p className="text-center text-sm mb-4">
          LOAN TYPE: <span className="text-[#00736e] font-bold">NANO LOAN</span>
        </p>
        <p className="text-sm mb-6">
          LOAN REFERENCE: <span className="font-bold">{loan?.reference}</span>{" "}
          <span className={isPaidUp ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
            {isPaidUp ? "Paid Up" : "Due"}
          </span>
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Received (NAD)</span>
              <span className="font-bold">{loan?.received?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest (%)</span>
              <span className="font-bold">{loan?.interest_percent?.toFixed(2)} %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest (NAD)</span>
              <span className="font-bold">{loan?.interest_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee (NAD)</span>
              <span className="font-bold">{loan?.processing_fee?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="font-bold">Total Repayable (NAD)</span>
              <span className="font-bold">{loan?.total_repayable?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Due Date :</span>
            <span>{loan?.due_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Outstanding Date :</span>
            <span>{loan?.outstanding_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Grace Date :</span>
            <span>{loan?.grace_date}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Make a payment via the methods listed below then upload the proof of payment to our online agents by clicking here:
        </p>

        <div className="h-px bg-gray-300 w-3/4 mx-auto mb-6" />

        <div className="space-y-3 mb-6">
          <Button 
            onClick={() => setLocation("/payment-record")}
            className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
          >
            Payment Record
          </Button>
          <Button className="w-full bg-[#00736e]/50 text-white font-bold uppercase tracking-wide h-[48px] rounded-lg cursor-not-allowed" disabled>
            PAY VIA PAYPULSE APP (COMING SOON)
          </Button>
          <Button className="w-full bg-[#00736e]/50 text-white font-bold uppercase tracking-wide h-[48px] rounded-lg cursor-not-allowed" disabled>
            NEW PAYMENT METHOD COMING SOON
          </Button>
        </div>

        <div className="text-center text-xs text-gray-600 space-y-1 mb-8">
          <p>Acc Name: <span className="font-medium">Destiny Group Pty LTD</span></p>
          <p>Bank: <span className="font-medium">Nedbank Namibia</span></p>
          <p>Acc no: <span className="font-medium">6000238099</span></p>
          <p>Account type: <span className="font-medium">Cheque</span></p>
          <p>Branch: <span className="font-medium">Corporate Branch</span></p>
          <p>Branch Code: <span className="font-medium">280173</span></p>
        </div>

        <div className="flex gap-4 pb-6">
          <Button 
            onClick={() => setLocation("/loan-history")}
            className="flex-1 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
          >
            History
          </Button>
          <Button 
            onClick={() => setLocation("/profile")}
            className="flex-1 bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
