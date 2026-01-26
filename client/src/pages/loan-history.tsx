import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface LoanHistoryRecord {
  date: string;
  loan_id: string;
  status: string;
  type: string;
}

// Format date to dd/mm/yy
const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

export default function LoanHistoryPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<LoanHistoryRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        console.log('📥 Fetching loan history for user:', profile.id);
        
        const historyData = await api.loans.getLoanHistory(profile.id);
        console.log('📡 Loan history response:', JSON.stringify(historyData, null, 2));
        
        // Map API response - expecting { success: true, loans: [...], total_nano, total_term, total_loans }
        if (historyData && historyData.success && historyData.loans) {
          const loans = historyData.loans || [];
          const mappedRecords = loans.map((loan: any) => ({
            date: loan.created_at || loan.date || '',
            loan_id: loan.loan_id || '',
            status: loan.status || 'PENDING',
            type: loan.loan_type || (loan.loan_id?.startsWith('TL') ? 'TERM' : 'NANO'),
          }));
          setRecords(mappedRecords);
          return;
        }
        
        // Fallback parsing
        const loans = historyData.loans || [];
        const mappedRecords = loans.map((loan: any) => ({
          date: loan.created_at || loan.date || '',
          loan_id: loan.loan_id || loan.reference || loan.id || '',
          status: loan.status || 'PENDING',
          type: loan.loan_type || (loan.loan_id?.startsWith('TL') ? 'TERM' : 'NANO'),
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
          <p className="mt-4 text-sm text-gray-500">Loading loan history...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-6 tracking-tight text-[20px]">
          LOAN HISTORY
        </h1>

        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-50 grid grid-cols-5 text-xs font-bold uppercase text-gray-600 py-3 px-2">
            <div className="text-center">Date</div>
            <div className="text-center">Loan ID</div>
            <div className="text-center">Status</div>
            <div className="text-center">Type</div>
            <div className="text-center">Contract</div>
          </div>
          {records.map((record, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-5 text-xs py-3 px-2 items-center ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-t border-gray-100`}
            >
              <div className="text-center text-gray-600">{formatDate(record.date)}</div>
              <div className="text-center text-[#00736e] font-medium">{record.loan_id}</div>
              <div className="text-center text-red-500 font-medium">{record.status}</div>
              <div className="text-center text-gray-600">{record.type}</div>
              <div className="text-center">
                <Button 
                  size="sm" 
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-white text-[10px] px-3 py-1 h-7 rounded"
                >
                  VIEW
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Make a payment via the methods listed below then upload the proof of payment to our online agents by clicking here:
        </p>

        <div className="space-y-3 mb-6">
          <Button 
            onClick={() => setLocation("/payment-record")}
            className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px]"
          >
            PAYMENT RECORD
          </Button>
          <Button 
            variant="outline"
            className="w-full border-2 border-[#D4A574] bg-transparent text-[#D4A574] font-bold uppercase tracking-wide h-[48px] hover:bg-[#D4A574]/10"
            disabled
          >
            PAY VIA PAYPULSE APP
          </Button>
          <Button 
            variant="outline"
            className="w-full border-2 border-[#E8C9A0] bg-transparent text-[#9ca3af] font-bold uppercase tracking-wide h-[48px]"
            disabled
          >
            NEW PAYMENT METHOD COMING SOON
          </Button>
        </div>

        <div className="pb-6">
          <Button 
            onClick={() => setLocation("/statement")}
            className="w-full bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[48px]"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
