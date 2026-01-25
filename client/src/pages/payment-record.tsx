import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface PaymentRecord {
  date: string;
  loan_id: string;
  type: string;
  received: string;
  balance: string;
}

export default function PaymentRecordPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        console.log('📥 Fetching payment history for user:', profile.id);
        
        const historyData = await api.loans.getPaymentHistory(profile.id);
        console.log('📡 Payment history response:', historyData);
        
        // Map API response to our interface
        const payments = historyData.payments || [];
        const mappedRecords = payments.map((payment: any) => ({
          date: payment.date || payment.payment_date || '',
          loan_id: payment.loan_id || payment.reference || '',
          type: payment.type || 'payment',
          received: payment.received || `N$${payment.amount?.toFixed(2) || '0.00'}`,
          balance: payment.balance || `N$${payment.remaining_balance?.toFixed(2) || '0.00'}`,
        }));
        
        setRecords(mappedRecords);
      } catch (error) {
        console.error("Error fetching data:", error);
        setRecords([]);
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
            <div className="text-center">Type</div>
            <div className="text-center">Received</div>
            <div className="text-center">Balance</div>
          </div>
          {records.map((record, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-5 text-xs py-3 px-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t border-gray-100`}
            >
              <div className="text-center text-gray-600">{record.date}</div>
              <div className="text-center text-[#00736e] font-medium">{record.loan_id}</div>
              <div className="text-center text-gray-600">{record.type}</div>
              <div className="text-center text-[#00736e]">{record.received}</div>
              <div className="text-center text-gray-800">{record.balance}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Make a payment via the methods listed below then upload the proof of payment to our online agents:
        </p>

        <div className="space-y-3 mb-6">
          <Button 
            onClick={() => setLocation("/statement")}
            className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
          >
            View Statement
          </Button>
          <Button className="w-full bg-[#00736e]/50 text-white font-bold uppercase tracking-wide h-[48px] rounded-lg cursor-not-allowed" disabled>
            PAY VIA PAYPULSE APP (COMING SOON)
          </Button>
          <Button className="w-full bg-[#00736e]/50 text-white font-bold uppercase tracking-wide h-[48px] rounded-lg cursor-not-allowed" disabled>
            NEW PAYMENT METHOD COMING SOON
          </Button>
        </div>

        <div className="pb-6">
          <Button 
            onClick={() => setLocation("/statement")}
            className="w-full bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
