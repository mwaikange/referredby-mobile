import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Star } from "lucide-react";

export default function Profile() {
  const [, setLocation] = useLocation();

  const handleSignOut = () => {
    setLocation("/login");
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="font-bold font-heading uppercase tracking-tight">Profile</h1>
          <Bell className="w-8 h-8 text-red-500" />
        </div>

        {/* Profile Info Grid */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Account Name</div>
            <div className="text-right text-black">DOBSON ANDRE</div>
          </div>
          
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Client ID</div>
            <div className="text-right text-black">8503029996</div>
          </div>
          
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Account UID</div>
            <div className="text-right text-black">RB1015</div>
          </div>
          
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Nano Installment</div>
            <div className="text-right text-black">MAX | NAD 2000.00</div>
          </div>
          
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Term Installment</div>
            <div className="text-right text-black">MAX | NAD 500.00</div>
          </div>
          
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Account Level</div>
            <div className="text-right text-black">NL5 / TLO</div>
          </div>
          
          <div className="flex justify-between items-center py-1">
            <div className="label text-gray-900 font-bold">Credit Rating</div>
            <div className="flex justify-end gap-0.5 text-black">
               <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
               <Star className="w-4 h-4 text-gray-300" />
               <Star className="w-4 h-4 text-gray-300" />
               <Star className="w-4 h-4 text-gray-300" />
               <Star className="w-4 h-4 text-gray-300" />
               <Star className="w-4 h-4 text-gray-300" />
               <Star className="w-4 h-4 text-gray-300" />
               <Star className="w-4 h-4 text-gray-300" />
               <Star className="w-4 h-4 text-gray-300" />
               <Star className="w-4 h-4 text-gray-300" />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 w-full mb-8" />

        {/* Document Status */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase">ID</span>
            <div className="w-6 h-6 bg-green-500 rounded-sm"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase whitespace-nowrap">Proof of Income</span>
            <div className="w-6 h-6 bg-green-500 rounded-sm"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase">KYC</span>
            <div className="w-6 h-6 bg-green-500 rounded-sm"></div>
          </div>
          <Settings className="w-6 h-6 text-gray-500" />
        </div>

        <div className="text-center text-[11px] text-gray-500 mb-8">
          Documents need to update on: 11 June 2026
        </div>

        {/* Update Button */}
        <div className="mb-10">
          <Button 
            disabled
            className="w-full bg-gray-200 text-gray-400 font-bold uppercase tracking-wide h-[54px] rounded-md cursor-not-allowed"
          >
            Update Documents
          </Button>
        </div>

        <div className="h-px bg-gray-200 w-full mb-8" />

        {/* Action Buttons */}
        <div className="space-y-4 flex-1 pb-10">
          <Button className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md">
            Request Nano Loan
          </Button>
          <Button className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md">
            Apply for Term Loan
          </Button>
          <Button className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md">
            Statement
          </Button>
          <Button className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md">
            Credit Score History
          </Button>

          <Button 
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md mt-8"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}
