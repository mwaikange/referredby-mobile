import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface ActivityRecord {
  id?: string;
  entity_id?: string;
  entity_type?: string;
  activity_type?: string;
  new_value?: string;
  note?: string;
  created_at?: string;
  loan_id: string;
  total_repayable?: number;
  loan_type?: 'nano' | 'term';
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
}

function getActivityTypeLabel(activity: ActivityRecord): string {
  const type = activity.activity_type || '';
  if (type === 'payment') return 'payment';
  if (type === 'disbursement') return 'disburseme...';
  if (type === 'status_change' || type === 'status_update') return 'status_cha...';
  return type.substring(0, 10) + (type.length > 10 ? '...' : '');
}

function getReceivedDisplay(activity: ActivityRecord): string {
  const note = activity.note || '';
  const type = activity.activity_type || '';
  
  if (type === 'payment') {
    const match = note.match(/NAD\s*([\d,.]+)/i);
    if (match) {
      return `N$${match[1]}`;
    }
  }
  
  if (type === 'disbursement') {
    if (note.toLowerCase().includes('paypulse') || note.toLowerCase().includes('paid via')) {
      return note.length > 20 ? note.substring(0, 18) + '...' : note;
    }
    return 'Loan disbursed';
  }
  
  if (type === 'status_change' || type === 'status_update') {
    if (note.toLowerCase().includes('settled') || note.toLowerCase().includes('full payment')) {
      return 'Loan settled - full payment received';
    }
    const statusMatch = note.match(/from\s+(\w+)\s+to\s+(\w+)/i);
    if (statusMatch) {
      return `Loan status changed from ${statusMatch[1]} to ${statusMatch[2]}`;
    }
    return note.length > 25 ? note.substring(0, 23) + '...' : note;
  }
  
  return note.length > 20 ? note.substring(0, 18) + '...' : (note || '-');
}

function getBalanceDisplay(activity: ActivityRecord): string {
  const type = activity.activity_type || '';
  const newValue = activity.new_value || '0.00';
  
  if (type === 'status_change' || type === 'status_update') {
    const note = activity.note || '';
    if (note.toLowerCase().includes('paid up') || note.toLowerCase().includes('pu')) {
      return 'Paid Up';
    }
    if (note.toLowerCase().includes('due') || note.match(/\bDU\b/)) {
      return 'Due';
    }
    const statusMatch = note.match(/to\s+(AA|AD|DU|OT|BL|PU|DE)/i);
    if (statusMatch) {
      const statusLabels: Record<string, string> = {
        'PU': 'Paid Up',
        'DU': 'Due',
        'AD': 'Disbursed',
        'AA': 'Approved',
        'OT': 'Outstanding',
        'BL': 'Blocked',
        'DE': 'Declined'
      };
      return statusLabels[statusMatch[1].toUpperCase()] || statusMatch[1];
    }
  }
  
  return `N$${parseFloat(newValue).toFixed(2)}`;
}

export default function PaymentRecordPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<ActivityRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        console.log('📥 Fetching payment history for user:', profile.id);
        
        const params = new URLSearchParams(search);
        const loanId = params.get('loan_id');
        
        let historyData;
        
        if (loanId) {
          console.log('📋 Fetching payments for loan_id:', loanId);
          historyData = await api.loans.getPaymentHistoryByLoanId(profile.id, loanId);
        } else {
          console.log('📋 Fetching all payments for user');
          historyData = await api.loans.getPaymentHistory(profile.id);
        }
        
        console.log('📡 Payment history response:', JSON.stringify(historyData, null, 2));
        
        if (historyData && historyData.payments && historyData.payments.length > 0) {
          setRecords(historyData.payments);
        } else if (historyData && Array.isArray(historyData) && historyData.length > 0) {
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
            <div className="text-center">Type</div>
            <div className="text-center">Received</div>
            <div className="text-center">Balance</div>
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
                data-testid={`row-payment-${index}`}
              >
                <div className="text-center text-gray-600">{formatDate(record.created_at)}</div>
                <div className="text-center text-[#00736e] font-medium">{record.loan_id}</div>
                <div className="text-center text-gray-600">{getActivityTypeLabel(record)}</div>
                <div className="text-center text-[#00736e]">{getReceivedDisplay(record)}</div>
                <div className="text-center text-gray-800">{getBalanceDisplay(record)}</div>
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
            className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
            data-testid="button-view-statement"
          >
            VIEW STATEMENT
          </Button>
          <Button 
            className="w-full bg-[#7dd3c4] hover:bg-[#5eead4] text-[#0f766e] font-bold uppercase tracking-wide h-[48px] rounded-lg"
            disabled
            data-testid="button-paypulse"
          >
            PAY VIA PAYPULSE APP (COMING SOON)
          </Button>
          <Button 
            className="w-full bg-[#7dd3c4] hover:bg-[#5eead4] text-[#0f766e] font-bold uppercase tracking-wide h-[48px] rounded-lg"
            disabled
            data-testid="button-new-payment"
          >
            NEW PAYMENT METHOD COMING SOON
          </Button>
        </div>

        <Button 
          onClick={() => setLocation("/statement")}
          className="w-full bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
          data-testid="button-back"
        >
          BACK
        </Button>
      </div>
    </Layout>
  );
}
