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
  grace_date?: string | null;
  principal?: number;
  outstanding_balance?: number;
  total_installments?: number;
  paid_installments?: number;
  remaining_installments?: number;
  next_due_date?: string;
  installment_amount?: number;
  lending_society?: {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await api.getProfile();
        setProfile(userProfile);
        
        console.log('📥 Loading statement for user:', userProfile.id);
        
        // Fetch both statement endpoints directly - the API will return the latest loan
        // Priority: Active loans first, then Paid-Up loans
        
        console.log('📊 Fetching nano loan statement...');
        const nanoStatement = await api.loans.getNanoLoanStatement(userProfile.id);
        console.log('📊 Nano statement response:', nanoStatement);
        
        // Check if nano statement has data (active or paid-up)
        const nanoData = nanoStatement.statement || (nanoStatement.loan_id ? nanoStatement : null);
        
        console.log('📊 Fetching term loan statement...');
        const termStatement = await api.loans.getTermLoanStatement(userProfile.id);
        console.log('📊 Term statement response:', termStatement);
        
        // Check if term statement has data (active or paid-up)
        const termData = termStatement.statement || (termStatement.loan_id ? termStatement : null);
        
        // Priority: Active Term > Active Nano > Paid-Up Term > Paid-Up Nano
        const activeStatuses = ['A', 'DU', 'OT'];
        
        // Check for active term loan first (term has priority per docs)
        if (termData && termData.loan_id && activeStatuses.includes(termData.status)) {
          console.log('📊 Found active TERM loan');
          setStatement(termData);
          setLoanType('term');
        }
        // Check for active nano loan
        else if (nanoData && nanoData.loan_id && activeStatuses.includes(nanoData.status)) {
          console.log('📊 Found active NANO loan');
          setStatement(nanoData);
          setLoanType('nano');
        }
        // Check for paid-up term loan
        else if (termData && termData.loan_id && termData.status === 'PU') {
          console.log('📊 Found paid-up TERM loan');
          setStatement(termData);
          setLoanType('term');
        }
        // Check for paid-up nano loan
        else if (nanoData && nanoData.loan_id && nanoData.status === 'PU') {
          console.log('📊 Found paid-up NANO loan');
          setStatement(nanoData);
          setLoanType('nano');
        }
        // Any nano loan
        else if (nanoData && nanoData.loan_id) {
          console.log('📊 Found NANO loan');
          setStatement(nanoData);
          setLoanType('nano');
        }
        // Any term loan
        else if (termData && termData.loan_id) {
          console.log('📊 Found TERM loan');
          setStatement(termData);
          setLoanType('term');
        }
        // No loans - we'll still show the statement UI with empty data
        else {
          console.log('📊 No loans found for user');
          setStatement(null);
          setLoanType('nano');
        }
        
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

  // Determine status label and color
  const getStatusInfo = (status: string | undefined) => {
    if (!status) return { label: 'No Record', color: 'text-gray-500' };
    switch (status) {
      case 'A': return { label: 'Active', color: 'text-blue-500' };
      case 'PU': return { label: 'Paid Up', color: 'text-green-500' };
      case 'DU': return { label: 'Due', color: 'text-orange-500' };
      case 'OT': return { label: 'Outstanding', color: 'text-red-500' };
      default: return { label: status, color: 'text-gray-500' };
    }
  };

  const statusInfo = getStatusInfo(statement?.status);
  const isTermLoan = loanType === 'term' || statement?.loan_type === 'TERM';
  const loanTypeLabel = isTermLoan ? 'TERM LOAN' : 'NANO LOAN';
  const titleLabel = isTermLoan ? 'TERM LOAN STATEMENT' : 'NANO LOAN STATEMENT';

  // Default bank details (fallback)
  const bankDetails = statement?.lending_society || {
    name: 'Destiny Group Pty LTD',
    bank: 'Nedbank Namibia',
    account_number: '6000238099',
    account_type: 'Cheque',
    branch: 'Corporate Branch',
    branch_code: '280173',
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-2 tracking-tight text-[20px]">
          {titleLabel}
        </h1>
        <p className="text-center text-sm mb-4">
          LOAN TYPE: <span className="text-[#00736e] font-bold">{loanTypeLabel}</span>
        </p>
        <p className="text-sm mb-6">
          LOAN REFERENCE: <span className="font-bold">{statement?.loan_id || 'N/A'}</span>{" "}
          <span className={`${statusInfo.color} font-medium`}>
            {statusInfo.label}
          </span>
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{isTermLoan ? 'Principal' : 'Received'} (NAD)</span>
              <span className="font-bold">{statement?.borrowed_amount?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest ( % )</span>
              <span className="font-bold">{statement?.interest_rate?.toFixed(2) || '0.00'} %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest (NAD )</span>
              <span className="font-bold">{statement?.interest_fee?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee(NAD)</span>
              <span className="font-bold">{statement?.processing_fee?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2">
              <span>Total Repayable ( NAD )</span>
              <span>{statement?.total_repayable?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Due Date :</span>
            <span>{statement?.due_date || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Outstanding Date :</span>
            <span>{statement?.outstanding_date || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Grace Date :</span>
            <span>{statement?.grace_date || statement?.paid_date || '-'}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Make a payment via the methods listed below then upload the proof of payment to our online agents by clicking here:
        </p>

        <div className="space-y-3 mb-6">
          <Button 
            onClick={() => setLocation("/payment-record")}
            className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
          >
            Payment Record
          </Button>
          <Button 
            className="w-full bg-white border-2 border-[#00736e] text-[#00736e] font-bold uppercase tracking-wide h-[48px] rounded-lg hover:bg-gray-50"
            disabled
          >
            PAY VIA PAYPULSE APP (COMING SOON)
          </Button>
          <Button 
            className="w-full bg-[#FF6B35] hover:bg-[#e55a2b] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
            disabled
          >
            NEW PAYMENT METHOD COMING SOON
          </Button>
        </div>

        <div className="text-center text-xs text-gray-600 space-y-1 mb-8">
          <p>Acc Name: <span className="font-medium">{bankDetails.name}</span></p>
          <p>Bank: <span className="font-medium">{bankDetails.bank}</span></p>
          <p>Acc no: <span className="font-medium">{bankDetails.account_number}</span></p>
          {bankDetails.account_type && (
            <p>Account type: <span className="font-medium">{bankDetails.account_type}</span></p>
          )}
          {bankDetails.branch && (
            <p>Branch: <span className="font-medium">{bankDetails.branch}</span></p>
          )}
          {bankDetails.branch_code && (
            <p>Branch Code: <span className="font-medium">{bankDetails.branch_code}</span></p>
          )}
        </div>

        <div className="flex gap-4 pb-6">
          <Button 
            onClick={() => setLocation("/loan-history")}
            className="flex-1 bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
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
