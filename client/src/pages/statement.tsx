import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api, type UserProfile } from "@/lib/api";

export default function Statement() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loanType, setLoanType] = useState<'nano' | 'term'>('nano');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await api.getProfile();
        setProfile(userProfile);
        // Determine loan type from membership status or loan_status
        const status = userProfile.membership_status || '';
        if (status.includes('TL') || status.includes('term')) {
          setLoanType('term');
        } else {
          setLoanType('nano');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
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
            LOAN REFERENCE: <span className="font-bold">TL86127543</span>{" "}
            <span className="text-red-500 font-medium">Due</span>
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Received (NAD)</span>
                <span className="font-bold">8200.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest (%)</span>
                <span className="font-bold">15.90 %</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest (NAD)</span>
                <span className="font-bold">1303.80</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee (NAD)</span>
                <span className="font-bold">0.00</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="font-bold">Total Repayable (NAD)</span>
                <span className="font-bold">9586.80</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Instalment Amount (NAD)</span>
                <span className="font-bold">958.68</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date :</span>
              <span>31 October 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Outstanding Date :</span>
              <span>01 December 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Grace Date :</span>
              <span>02 November 2026</span>
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
            <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold uppercase tracking-wide h-[48px] rounded-lg">
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

          <div className="flex gap-4 pb-10">
            <Button className="flex-1 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg">
              History
            </Button>
            <Button 
              onClick={() => setLocation("/profile")}
              className="flex-1 bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
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
          LOAN REFERENCE: <span className="font-bold">NL14793071</span>{" "}
          <span className="text-green-500 font-medium">Paid Up</span>
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Received (NAD)</span>
              <span className="font-bold">4200.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest (%)</span>
              <span className="font-bold">14.05 %</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest (NAD)</span>
              <span className="font-bold">590.10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee (NAD)</span>
              <span className="font-bold">40.00</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="font-bold">Total Repayable (NAD)</span>
              <span className="font-bold">4830.10</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Due Date :</span>
            <span>15 January 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Outstanding Date :</span>
            <span>15 February 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Grace Date :</span>
            <span>17 January 2026</span>
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
          <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold uppercase tracking-wide h-[48px] rounded-lg">
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

        <div className="flex gap-4 pb-10">
          <Button className="flex-1 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg">
            History
          </Button>
          <Button 
            onClick={() => setLocation("/profile")}
            className="flex-1 bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[48px] rounded-lg"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
