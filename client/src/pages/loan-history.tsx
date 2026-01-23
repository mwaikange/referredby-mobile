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

export default function LoanHistoryPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<LoanHistoryRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await api.getProfile();
        setRecords([
          { date: "31/12/25", loan_id: "TL86127543", status: "DUE", type: "TERM" },
        ]);
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
              <div className="text-center text-gray-600">{record.date}</div>
              <div className="text-center text-[#00736e] font-medium">{record.loan_id}</div>
              <div className="text-center text-red-500 font-medium">{record.status}</div>
              <div className="text-center text-gray-600">{record.type}</div>
              <div className="text-center">
                <Button 
                  size="sm" 
                  className="bg-[#0B0B3B] hover:bg-[#151555] text-white text-[10px] px-3 py-1 h-7 rounded"
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
            className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
          >
            Payment Record
          </Button>
          <Button className="w-full bg-[#00736e]/50 text-white font-bold uppercase tracking-wide h-[48px] rounded-lg cursor-not-allowed" disabled>
            PAY VIA PAYPULSE APP
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
