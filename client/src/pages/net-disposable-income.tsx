import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function NetDisposableIncome() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [netSalary, setNetSalary] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        console.log('📥 Loading NDI data for user:', profile.id);
        
        // Prefill net salary from profile if available
        const profileData = profile as any;
        if (profileData?.net_salary) {
          setNetSalary(profileData.net_salary.toString());
        } else if (profileData?.monthly_salary) {
          setNetSalary(profileData.monthly_salary.toString());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const [rentBond, setRentBond] = useState("3800");
  const [food, setFood] = useState("1200");
  const [transport, setTransport] = useState("120");
  const [loans, setLoans] = useState("2500");
  const [otherExpenses, setOtherExpenses] = useState("4500");

  const totalExpenses = useMemo(() => {
    return (
      (parseFloat(rentBond) || 0) +
      (parseFloat(food) || 0) +
      (parseFloat(transport) || 0) +
      (parseFloat(loans) || 0) +
      (parseFloat(otherExpenses) || 0)
    );
  }, [rentBond, food, transport, loans, otherExpenses]);

  const ndi = useMemo(() => {
    return (parseFloat(netSalary) || 0) - totalExpenses;
  }, [netSalary, totalExpenses]);

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-8 tracking-tight text-[20px]">
          NET DISPOSABLE INCOME
        </h1>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase">NET SALARY</span>
            <Input
              value={netSalary}
              onChange={(e) => setNetSalary(e.target.value)}
              className="w-28 bg-gray-100 border border-gray-200 h-10 text-right rounded-lg"
            />
          </div>
          <p className="text-[10px] text-gray-500">*Must match Bank Statement or Payslip</p>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase">RENT / BOND</span>
            <Input
              value={rentBond}
              onChange={(e) => setRentBond(e.target.value)}
              className="w-28 bg-gray-100 border border-gray-200 h-10 text-right rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase">FOOD</span>
            <Input
              value={food}
              onChange={(e) => setFood(e.target.value)}
              className="w-28 bg-gray-100 border border-gray-200 h-10 text-right rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase">TRANSPORT/ FUEL</span>
            <Input
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
              className="w-28 bg-gray-100 border border-gray-200 h-10 text-right rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase">LOANS</span>
            <Input
              value={loans}
              onChange={(e) => setLoans(e.target.value)}
              className="w-28 bg-gray-100 border border-gray-200 h-10 text-right rounded-lg"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase">ALL OTHER EXPENSES</span>
            <Input
              value={otherExpenses}
              onChange={(e) => setOtherExpenses(e.target.value)}
              className="w-28 bg-gray-100 border border-gray-200 h-10 text-right rounded-lg"
            />
          </div>

          <div className="h-px bg-gray-200 my-4" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase">TOTAL EXPENSES</span>
            <div className="w-28 bg-gray-200 h-10 flex items-center justify-end px-3 rounded-lg">
              <span className="text-sm">N$ {totalExpenses.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-xs font-bold uppercase">NET DISPOSABLE INCOME</span>
            <span className="text-lg font-bold text-[#00736e]">N$ {ndi.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-4 pb-10">
          <Button className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg">
            Save
          </Button>
          
          <Button 
            onClick={() => setLocation("/term-loans")}
            className="w-full bg-[#C41E3A] hover:bg-[#a11830] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
