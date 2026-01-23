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
        
        // Check for active loan from profile data
        // The API should return active_loan or similar field
        const profileData = userProfile as any;
        
        // Determine loan type based on available data
        // Priority: active_loan > loan_type > membership_status prefix
        if (profileData.active_loan) {
          const loan = profileData.active_loan;
          setActiveLoan({
            id: loan.id || '',
            reference: loan.reference || loan.loan_id || '',
            type: loan.type || (loan.reference?.startsWith('TL') ? 'term' : 'nano'),
            status: loan.status || 'Due',
            received: loan.received || loan.amount || 0,
            interest_percent: loan.interest_percent || loan.interest_rate || 0,
            interest_amount: loan.interest_amount || loan.interest || 0,
            processing_fee: loan.processing_fee || 0,
            total_repayable: loan.total_repayable || loan.total || 0,
            instalment_amount: loan.instalment_amount,
            due_date: loan.due_date || '',
            outstanding_date: loan.outstanding_date || '',
            grace_date: loan.grace_date || '',
          });
          setLoanType(loan.type || (loan.reference?.startsWith('TL') ? 'term' : 'nano'));
        } else {
          // Fallback: determine from membership_status or other fields
          const status = userProfile.membership_status || '';
          const hasTermLoan = status.includes('TL') || status.startsWith('AT') || profileData.active_term_loan;
          const hasNanoLoan = status.includes('NL') || status.startsWith('AN') || profileData.active_nano_loan;
          
          if (hasTermLoan) {
            setLoanType('term');
            // Mock term loan data - will be replaced by API
            setActiveLoan({
              id: '1',
              reference: 'TL86127543',
              type: 'term',
              status: 'Due',
              received: 8200.00,
              interest_percent: 15.90,
              interest_amount: 1303.80,
              processing_fee: 0.00,
              total_repayable: 9586.80,
              instalment_amount: 958.68,
              due_date: '31 October 2026',
              outstanding_date: '01 December 2026',
              grace_date: '02 November 2026',
            });
          } else {
            setLoanType('nano');
            // Mock nano loan data - will be replaced by API
            setActiveLoan({
              id: '2',
              reference: 'NL95726406',
              type: 'nano',
              status: 'Due',
              received: 780.00,
              interest_percent: 25.74,
              interest_amount: 200.77,
              processing_fee: 32.00,
              total_repayable: 1012.77,
              due_date: '24 March 2026',
              outstanding_date: '24 April 2026',
              grace_date: '26 March 2026',
            });
          }
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

          <div className="space-y-3 mb-6">
            <Button className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg">
              Payment Record
            </Button>
            <Button variant="outline" className="w-full border-2 border-gray-300 text-gray-400 font-bold uppercase tracking-wide h-[48px] rounded-lg" disabled>
              PAY VIA PAYPULSE APP (COMING SOON)
            </Button>
            <Button variant="outline" className="w-full border-2 border-gray-300 text-gray-400 font-bold uppercase tracking-wide h-[48px] rounded-lg" disabled>
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
            <Button className="flex-1 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg">
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

        <div className="space-y-3 mb-6">
          <Button className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg">
            Payment Record
          </Button>
          <Button variant="outline" className="w-full border-2 border-gray-300 text-gray-400 font-bold uppercase tracking-wide h-[48px] rounded-lg" disabled>
            PAY VIA PAYPULSE APP (COMING SOON)
          </Button>
          <Button variant="outline" className="w-full border-2 border-gray-300 text-gray-400 font-bold uppercase tracking-wide h-[48px] rounded-lg" disabled>
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
          <Button className="flex-1 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg">
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
