import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function InterestConfirmation() {
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-6 tracking-tight">INTEREST CONFIRMATION</h1>

        {/* Green Info Card */}
        <div className="bg-[#006f3c] text-white p-4 rounded-lg mb-6 shadow-md">
          <div className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
            <div className="font-bold">Referring Partner:</div>
            <div>nashe peno</div>
            <div className="font-bold">Lender:</div>
            <div>Destiny Group Pty LTD</div>
            <div className="font-bold">Lending Society:</div>
            <div>kayla industries</div>
            <div className="font-bold">Borrower:</div>
            <div>DOBSON ANDRE</div>
          </div>
        </div>

        {/* Active Interest Mode Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#eef2ff] text-[#3730a3] px-4 py-2 rounded-md text-xs font-bold border border-[#e0e7ff]">
            Active Interest Mode: IIR (Rating-Based)
          </div>
        </div>

        {/* PIR Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-1">Portfolio Interest Rate (PIR)</h2>
          <p className="text-sm">Base Rate: <span className="font-bold">28.00%</span></p>
        </div>

        <div className="h-px bg-gray-100 w-full mb-6" />

        {/* IIR Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3">Individual Interest Rate (IIR)</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>0–3 Stars (Fair):</span>
              <span className="font-bold">17.20%</span>
            </div>
            <div className="flex justify-between">
              <span>4–6 Stars (Good):</span>
              <span className="font-bold">11.99%</span>
            </div>
            <div className="flex justify-between">
              <span>7–10 Stars (Excellent):</span>
              <span className="font-bold">7.74%</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full mb-6" />

        {/* SIR Section */}
        <div className="bg-[#f0fdf4] p-4 rounded-lg border border-[#dcfce7] mb-6">
          <h2 className="text-sm font-bold mb-2">Subsidized Interest Rate (SIR)</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subsidy Enabled:</span>
              <span className="font-bold">3.15%</span>
            </div>
            <p className="text-xs">Policy: <span className="font-bold">Applies After IIR</span></p>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full mb-6" />

        {/* Fees Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3">Fees</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Processing Fee:</span>
              <span className="font-bold">N$ 40.00</span>
            </div>
            <div className="flex justify-between">
              <span>Late Fee (Accumulating Arrears):</span>
              <span className="font-bold">5%</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full mb-6" />

        {/* Nano Loan Limits */}
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3">Nano Loan Limits</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Level 1:</span>
              <span className="font-bold">N$ 2000.00</span>
            </div>
            <div className="flex justify-between">
              <span>Level 2:</span>
              <span className="font-bold">N$ 4200.00</span>
            </div>
            <div className="flex justify-between">
              <span>Level 3:</span>
              <span className="font-bold">N$ 8700.00</span>
            </div>
          </div>
        </div>

        {/* Applicable Rate Card (Yellow) */}
        <div className="bg-[#fffbeb] p-5 rounded-lg border border-[#fef3c7] mb-10 shadow-sm">
          <h2 className="text-base font-bold mb-4">Your Applicable Rate</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span>Your Rating:</span>
              <span className="font-bold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Your Tier:</span>
              <span className="font-bold">Fair (0–3)</span>
            </div>
          </div>
          
          <div className="h-px bg-[#fef3c7] w-full mb-4" />
          
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span>Interest Basis:</span>
              <span className="font-bold uppercase text-xs">IIR</span>
            </div>
            <div className="flex justify-between">
              <span>Subsidy Status:</span>
              <span className="font-bold">Applied</span>
            </div>
          </div>
          
          <div className="h-px bg-[#fef3c7] w-full mb-4" />
          
          <div className="flex justify-between items-end">
            <div className="text-sm leading-tight">
              <span className="font-bold block">Your Final Interest Rate:</span>
              <span className="text-[10px] text-gray-400 font-medium">(IIR - SIR)</span>
            </div>
            <div className="text-3xl font-bold text-[#006f3c]">14.05%</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4 pb-10">
          <Button 
            className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md"
          >
            Proceed
          </Button>
          <Button 
            onClick={() => setLocation("/profile")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
