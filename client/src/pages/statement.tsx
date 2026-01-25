import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api, type UserProfile } from "@/lib/api";

interface LoanStatement {
  loan_id: string;
  loan_type: 'NANO' | 'TERM';
  status: string;
  borrowed_amount: number;
  interest_rate: number;
  interest_fee: number;
  processing_fee: number;
  total_repayable: number;
  outstanding_amount: number;
  amount_paid: number;
  due_date: string;
  outstanding_date: string | null;
  paid_date: string | null;
  principal?: number;
  outstanding_balance?: number;
  total_installments?: number;
  paid_installments?: number;
  remaining_installments?: number;
  next_due_date?: string;
  installment_amount?: number;
  lending_society: {
    name: string;
    bank: string;
    account_number: string;
    account_type?: string;
    branch?: string;
    branch_code?: string;
  };
}

export default function Statement() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statement, setStatement] = useState<LoanStatement | null>(null);
  const [loanType, setLoanType] = useState<'nano' | 'term'>('nano');
  const [hasLoans, setHasLoans] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await api.getProfile();
        setProfile(userProfile);
        const profileData = userProfile as any;
        
        console.log('📥 Loading statement for user:', userProfile.id);
        
        // Fetch both statement endpoints directly - the API will return the latest loan
        // Priority: Active loans first, then Paid-Up loans
        // Try nano first, then term
        
        console.log('📊 Fetching nano loan statement...');
        const nanoStatement = await api.loans.getNanoLoanStatement(userProfile.id);
        console.log('📊 Nano statement response:', nanoStatement);
        
        // Check if nano statement has data (active or paid-up)
        const nanoData = nanoStatement.statement || (nanoStatement.loan_id ? nanoStatement : null);
        if (nanoData && nanoData.loan_id) {
          const nanoStatus = nanoData.status;
          const isNanoActive = nanoStatus === 'A' || nanoStatus === 'DU' || nanoStatus === 'OT';
          
          if (isNanoActive) {
            console.log('📊 Found active NANO loan');
            setStatement(nanoData);
            setLoanType('nano');
            setHasLoans(true);
            setLoading(false);
            return;
          }
        }
        
        console.log('📊 Fetching term loan statement...');
        const termStatement = await api.loans.getTermLoanStatement(userProfile.id);
        console.log('📊 Term statement response:', termStatement);
        
        // Check if term statement has data (active or paid-up)
        const termData = termStatement.statement || (termStatement.loan_id ? termStatement : null);
        if (termData && termData.loan_id) {
          const termStatus = termData.status;
          const isTermActive = termStatus === 'A' || termStatus === 'DU' || termStatus === 'OT';
          
          if (isTermActive) {
            console.log('📊 Found active TERM loan');
            setStatement(termData);
            setLoanType('term');
            setHasLoans(true);
            setLoading(false);
            return;
          }
        }
        
        // No active loans - check for paid-up loans
        if (nanoData && nanoData.loan_id && nanoData.status === 'PU') {
          console.log('📊 Found paid-up NANO loan');
          setStatement(nanoData);
          setLoanType('nano');
          setHasLoans(true);
          setLoading(false);
          return;
        }
        
        if (termData && termData.loan_id && termData.status === 'PU') {
          console.log('📊 Found paid-up TERM loan');
          setStatement(termData);
          setLoanType('term');
          setHasLoans(true);
          setLoading(false);
          return;
        }
        
        // No loans found - show empty state
        console.log('📊 No loans found for user');
        setHasLoans(false);
        
      } catch (error) {
        console.error("Error fetching statement:", error);
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

  // Show empty state when no loans at all
  if (!hasLoans || !statement) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col font-sans">
          <h1 className="text-center font-bold uppercase mb-2 tracking-tight text-[20px]">
            STATEMENTS
          </h1>
          
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">No Loans Yet</h2>
            <p className="text-sm text-gray-500 text-center px-8 mb-6">
              You haven't taken any loans yet. Apply for a loan to get started.
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

  const isPaidUp = statement.status === 'PU';
  const isActive = statement.status === 'A';
  const statusLabel = isPaidUp ? 'Paid Up' : isActive ? 'Active' : 'Due';
  const statusColor = isPaidUp ? 'text-green-500' : isActive ? 'text-blue-500' : 'text-red-500';

  // Term Loan Statement
  if (loanType === 'term' || statement.loan_type === 'TERM') {
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
            LOAN REFERENCE: <span className="font-bold">{statement.loan_id}</span>{" "}
            <span className={`${statusColor} font-medium`}>
              {statusLabel}
            </span>
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Principal (NAD)</span>
                <span className="font-bold">{(statement.principal || statement.borrowed_amount)?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate (%)</span>
                <span className="font-bold">{statement.interest_rate?.toFixed(2)} %</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee (NAD)</span>
                <span className="font-bold">{statement.processing_fee?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="font-bold">Total Repayable (NAD)</span>
                <span className="font-bold">{statement.total_repayable?.toFixed(2)}</span>
              </div>
              {(statement.outstanding_balance !== undefined || statement.outstanding_amount > 0) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Outstanding Balance (NAD)</span>
                  <span className="font-bold text-red-600">{(statement.outstanding_balance ?? statement.outstanding_amount)?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid (NAD)</span>
                <span className="font-bold text-green-600">{statement.amount_paid?.toFixed(2)}</span>
              </div>
              {statement.installment_amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Instalment Amount (NAD)</span>
                  <span className="font-bold">{statement.installment_amount?.toFixed(2)}</span>
                </div>
              )}
              {statement.total_installments && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Instalments</span>
                  <span className="font-bold">{statement.paid_installments || 0} of {statement.total_installments} paid</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date :</span>
              <span>{statement.due_date}</span>
            </div>
            {statement.next_due_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Next Due Date :</span>
                <span>{statement.next_due_date}</span>
              </div>
            )}
            {statement.outstanding_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding Date :</span>
                <span>{statement.outstanding_date}</span>
              </div>
            )}
            {statement.paid_date && (
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Date :</span>
                <span className="text-green-600 font-medium">{statement.paid_date}</span>
              </div>
            )}
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
            <p>Acc Name: <span className="font-medium">{statement.lending_society?.name}</span></p>
            <p>Bank: <span className="font-medium">{statement.lending_society?.bank}</span></p>
            <p>Acc no: <span className="font-medium">{statement.lending_society?.account_number}</span></p>
            {statement.lending_society?.account_type && (
              <p>Account type: <span className="font-medium">{statement.lending_society.account_type}</span></p>
            )}
            {statement.lending_society?.branch && (
              <p>Branch: <span className="font-medium">{statement.lending_society.branch}</span></p>
            )}
            {statement.lending_society?.branch_code && (
              <p>Branch Code: <span className="font-medium">{statement.lending_society.branch_code}</span></p>
            )}
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
          LOAN REFERENCE: <span className="font-bold">{statement.loan_id}</span>{" "}
          <span className={`${statusColor} font-medium`}>
            {statusLabel}
          </span>
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Borrowed (NAD)</span>
              <span className="font-bold">{statement.borrowed_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest (%)</span>
              <span className="font-bold">{statement.interest_rate?.toFixed(2)} %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest (NAD)</span>
              <span className="font-bold">{statement.interest_fee?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee (NAD)</span>
              <span className="font-bold">{statement.processing_fee?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="font-bold">Total Repayable (NAD)</span>
              <span className="font-bold">{statement.total_repayable?.toFixed(2)}</span>
            </div>
            {statement.outstanding_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding Amount (NAD)</span>
                <span className="font-bold text-red-600">{statement.outstanding_amount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid (NAD)</span>
              <span className="font-bold text-green-600">{statement.amount_paid?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Due Date :</span>
            <span>{statement.due_date}</span>
          </div>
          {statement.outstanding_date && (
            <div className="flex justify-between">
              <span className="text-gray-600">Outstanding Date :</span>
              <span>{statement.outstanding_date}</span>
            </div>
          )}
          {statement.paid_date && (
            <div className="flex justify-between">
              <span className="text-gray-600">Paid Date :</span>
              <span className="text-green-600 font-medium">{statement.paid_date}</span>
            </div>
          )}
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
          <p>Acc Name: <span className="font-medium">{statement.lending_society?.name}</span></p>
          <p>Bank: <span className="font-medium">{statement.lending_society?.bank}</span></p>
          <p>Acc no: <span className="font-medium">{statement.lending_society?.account_number}</span></p>
          {statement.lending_society?.account_type && (
            <p>Account type: <span className="font-medium">{statement.lending_society.account_type}</span></p>
          )}
          {statement.lending_society?.branch && (
            <p>Branch: <span className="font-medium">{statement.lending_society.branch}</span></p>
          )}
          {statement.lending_society?.branch_code && (
            <p>Branch Code: <span className="font-medium">{statement.lending_society.branch_code}</span></p>
          )}
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
