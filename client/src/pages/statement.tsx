import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api, type UserProfile } from "@/lib/api";

interface LoanData {
  loan_id: string;
  status: string;
  loan_amount: number;
  borrowed_amount?: number;
  interest_rate: number;
  interest_amount: number;
  interest_fee?: number;
  processing_fee_amount: number;
  processing_fee?: number;
  total_repayable: number;
  outstanding_amount?: number;
  amount_paid?: number;
  due_date: string;
  outstanding_date: string | null;
  grace_date?: string | null;
  paid_date?: string | null;
  lending_society_id?: string;
  user_id?: string;
  created_at?: string;
}

interface StatementResponse {
  success: boolean;
  loan: LoanData | null;
  loan_type: 'nano' | 'term';
  is_active: boolean;
  is_paid_up: boolean;
}

export default function Statement() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [statementData, setStatementData] = useState<StatementResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await api.getProfile();
        setProfile(userProfile);
        
        console.log('📥 Loading statement for user:', userProfile.id);
        
        // Use the unified statement endpoint
        const response = await api.loans.getStatement(userProfile.id);
        console.log('📊 Statement API response:', JSON.stringify(response, null, 2));
        
        // Check success and loan exists
        if (response && response.success === true && response.loan) {
          console.log('✅ Loan data found:', response.loan);
          console.log('📋 Loan type:', response.loan_type);
          console.log('🔥 Is active:', response.is_active);
          console.log('✅ Is paid up:', response.is_paid_up);
          setStatementData(response);
        } else {
          console.log('❌ No loan data in response');
          setStatementData(null);
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

  const loan = statementData?.loan;
  const loanType = statementData?.loan_type || 'nano';
  const isActive = statementData?.is_active || false;
  const isPaidUp = statementData?.is_paid_up || false;

  // Use correct field names with fallbacks
  const loanAmount = loan?.loan_amount ?? loan?.borrowed_amount ?? 0;
  const interestAmount = loan?.interest_amount ?? loan?.interest_fee ?? 0;
  const processingFee = loan?.processing_fee_amount ?? loan?.processing_fee ?? 0;
  const interestRate = loan?.interest_rate ?? 0;
  const totalRepayable = loan?.total_repayable ?? 0;

  // Determine status label and color
  const getStatusInfo = (status: string | undefined) => {
    if (!status) return { label: 'No Record', color: 'text-gray-500' };
    switch (status) {
      case 'A': return { label: 'Active', color: 'text-blue-500' };
      case 'PU': return { label: 'Paid Up', color: 'text-green-500' };
      case 'DU': return { label: 'Due', color: 'text-orange-500' };
      case 'OT': return { label: 'Outstanding', color: 'text-red-500' };
      case 'BL': return { label: 'Blocked', color: 'text-red-500' };
      default: return { label: status, color: 'text-gray-500' };
    }
  };

  const statusInfo = getStatusInfo(loan?.status);
  const isTermLoan = loanType === 'term';
  const loanTypeLabel = isTermLoan ? 'TERM LOAN' : 'NANO LOAN';
  const titleLabel = isTermLoan ? 'TERM LOAN STATEMENT' : 'NANO LOAN STATEMENT';

  // Default bank details
  const bankDetails = {
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
          LOAN REFERENCE: <span className="font-bold">{loan?.loan_id || 'N/A'}</span>{" "}
          <span className={`${statusInfo.color} font-medium`}>
            {statusInfo.label}
          </span>
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{isTermLoan ? 'Principal' : 'Received'} (NAD)</span>
              <span className="font-bold">{loanAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest ( % )</span>
              <span className="font-bold">{interestRate.toFixed(2)} %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest (NAD )</span>
              <span className="font-bold">{interestAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee(NAD)</span>
              <span className="font-bold">{processingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2">
              <span>Total Repayable ( NAD )</span>
              <span>{totalRepayable.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Due Date :</span>
            <span>{loan?.due_date || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Outstanding Date :</span>
            <span>{loan?.outstanding_date || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Grace Date :</span>
            <span>{loan?.grace_date || loan?.paid_date || '-'}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Make a payment via the methods listed below then upload the proof of payment to our online agents by clicking here:
        </p>

        <div className="space-y-3 mb-6">
          <Button 
            onClick={() => setLocation(`/payment-record?loan_type=${loanType}`)}
            className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-full"
          >
            PAYMENT RECORD
          </Button>
          <Button 
            className="w-full bg-[#D4A574] hover:bg-[#c49564] text-white font-bold uppercase tracking-wide h-[48px] rounded-full"
            disabled
          >
            PAY VIA PAYPULSE APP (COMING SOON)
          </Button>
          <Button 
            className="w-full bg-[#E8C9A0] hover:bg-[#d8b990] text-[#8B4513] font-bold uppercase tracking-wide h-[48px] rounded-full"
            disabled
          >
            NEW PAYMENT METHOD COMING SOON
          </Button>
        </div>

        <div className="text-center text-xs text-gray-600 space-y-1 mb-8">
          <p>Acc Name: <span className="font-medium">{bankDetails.name}</span></p>
          <p>Bank: <span className="font-medium">{bankDetails.bank}</span></p>
          <p>Acc no: <span className="font-medium">{bankDetails.account_number}</span></p>
          <p>Account type: <span className="font-medium">{bankDetails.account_type}</span></p>
          <p>Branch: <span className="font-medium">{bankDetails.branch}</span></p>
          <p>Branch Code: <span className="font-medium">{bankDetails.branch_code}</span></p>
        </div>

        <div className="flex gap-4 pb-6">
          <Button 
            onClick={() => setLocation("/loan-history")}
            className="flex-1 bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-full"
          >
            HISTORY
          </Button>
          <Button 
            onClick={() => setLocation("/profile")}
            className="flex-1 bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[48px] rounded-full"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
