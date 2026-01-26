import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface PaymentRecord {
  id?: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference?: string;
  status?: string;
}

export default function PaymentRecordPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loanType, setLoanType] = useState<'nano' | 'term'>('nano');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        console.log('📥 Fetching payment history for user:', profile.id);
        
        // Get loan_id or loan_type from URL params
        const params = new URLSearchParams(search);
        const loanId = params.get('loan_id');
        let currentLoanType = params.get('loan_type') as 'nano' | 'term' || 'nano';
        
        let historyData;
        
        if (loanId) {
          // Fetch by specific loan_id
          console.log('📋 Fetching payments for loan_id:', loanId);
          historyData = await api.loans.getPaymentHistoryByLoanId(profile.id, loanId);
        } else {
          // Fetch all payments for user (API now supports this without loan_type)
          console.log('📋 Fetching all payments for user');
          historyData = await api.loans.getPaymentHistory(profile.id);
        }
        
        console.log('📡 Payment history response:', JSON.stringify(historyData, null, 2));
        
        // Handle response - check for payments array
        if (historyData && historyData.payments && historyData.payments.length > 0) {
          setRecords(historyData.payments);
          if (historyData.loan_type) {
            setLoanType(historyData.loan_type);
          }
        } else if (historyData && Array.isArray(historyData) && historyData.length > 0) {
          // Handle if API returns array directly
          setRecords(historyData);
        } else {
          setRecords([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search]);

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center font-sans min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#00736e]" />
          <p className="mt-4 text-sm text-gray-500">Loading payment records...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-6 tracking-tight text-[20px]">
          PAYMENT RECORD
        </h1>

        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-50 grid grid-cols-5 text-xs font-bold uppercase text-gray-600 py-3 px-2">
            <div className="text-center">Date</div>
            <div className="text-center">Loan_ID</div>
            <div className="text-center">Method</div>
            <div className="text-center">Amount</div>
            <div className="text-center">Status</div>
          </div>
          {records.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              No payment records found
            </div>
          ) : (
            records.map((record, index) => (
              <div 
                key={record.id || index} 
                className={`grid grid-cols-5 text-xs py-3 px-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t border-gray-100`}
              >
                <div className="text-center text-gray-600">{record.payment_date}</div>
                <div className="text-center text-[#00736e] font-medium">{record.loan_id}</div>
                <div className="text-center text-gray-600">{record.payment_method || 'Transfer'}</div>
                <div className="text-center text-[#00736e]">N${record.amount?.toFixed(2)}</div>
                <div className="text-center text-gray-800">{record.status || 'verified'}</div>
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Make a payment via the methods listed below then upload the proof of payment to our online agents:
        </p>

        <div className="space-y-3 mb-6">
          <Button 
            onClick={() => setLocation("/statement")}
            className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px]"
          >
            VIEW STATEMENT
          </Button>
          <Button 
            className="w-full bg-[#7dd3c4] hover:bg-[#5eead4] text-[#0f766e] font-bold uppercase tracking-wide h-[48px]"
            disabled
          >
            PAY VIA PAYPULSE APP (COMING SOON)
          </Button>
          <Button 
            className="w-full bg-[#7dd3c4] hover:bg-[#5eead4] text-[#0f766e] font-bold uppercase tracking-wide h-[48px]"
            disabled
          >
            NEW PAYMENT METHOD COMING SOON
          </Button>
        </div>

        <Button 
          onClick={() => setLocation("/statement")}
          className="w-full bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[48px]"
        >
          BACK
        </Button>
      </div>
    </Layout>
  );
}
