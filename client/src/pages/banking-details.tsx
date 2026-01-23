import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BankingDetails() {
  const [, setLocation] = useLocation();
  const [accountName, setAccountName] = useState("OAKAFOR JOHN");
  const [bank, setBank] = useState("Standard Bank Namibia");
  const [branch, setBranch] = useState("Katutura Branch");
  const [branchCode, setBranchCode] = useState("70098");
  const [accountNumber, setAccountNumber] = useState("60008292656");

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-8 tracking-tight text-[20px]">
          BANKING DETAILS
        </h1>

        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-black text-center">
              Account Name
            </label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="bg-gray-200 border-0 h-12 text-center rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-black text-center">
              Select Bank
            </label>
            <div className="bg-white border border-gray-300 rounded-lg h-12 flex items-center justify-between px-4">
              <span className="text-sm">{bank}</span>
              <span className="text-gray-400">▼</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-black text-center">
              Branch
            </label>
            <Input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="bg-gray-200 border-0 h-12 text-center rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-black text-center">
              Branch Code
            </label>
            <Input
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              className="bg-gray-200 border-0 h-12 text-center rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-black text-center">
              Account Number
            </label>
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="bg-gray-200 border-0 h-12 text-center rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-4 pb-10">
          <Button className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg">
            Save
          </Button>
          
          <Button 
            onClick={() => setLocation("/term-loans")}
            className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
