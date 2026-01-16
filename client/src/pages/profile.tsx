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
      <div className="flex-1 flex flex-col p-6 font-sans">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold font-heading uppercase tracking-tight">Profile</h1>
          <div className="relative">
            <Bell className="w-8 h-8 text-red-600 fill-red-600" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* Profile Info Grid */}
        <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 text-sm font-medium mb-6">
          <div className="text-gray-900 font-bold">Account Name</div>
          <div className="text-right text-black">Mwaikange Motinga</div>
          
          <div className="text-gray-900 font-bold">Client ID</div>
          <div className="text-right text-black">800000000000</div>
          
          <div className="text-gray-900 font-bold">Account UID</div>
          <div className="text-right text-black">6502</div>
          
          <div className="text-gray-900 font-bold">Nano Installment</div>
          <div className="text-right text-black">MAX | NAD 2000-00</div>
          
          <div className="text-gray-900 font-bold">Term Installment</div>
          <div className="text-right text-black">MAX | NAD 2000-00</div>
          
          <div className="text-gray-900 font-bold">Account Level</div>
          <div className="text-right text-black">NL5 / TL 0</div>
          
          <div className="text-gray-900 font-bold self-center">Credit Rating</div>
          <div className="flex justify-end gap-0.5 text-black">
             <Star className="w-4 h-4 fill-yellow-400 text-black" />
             <Star className="w-4 h-4 text-black" />
             <Star className="w-4 h-4 text-black" />
             <Star className="w-4 h-4 text-black" />
             <Star className="w-4 h-4 text-black" />
             <Star className="w-4 h-4 text-black" />
             <Star className="w-4 h-4 text-black" />
             <Star className="w-4 h-4 text-black" />
             <Star className="w-4 h-4 text-black" />
             <Star className="w-4 h-4 text-black" />
          </div>
        </div>

        <div className="h-px bg-gray-300 w-full mb-4" />

        {/* Document Status */}
        <div className="flex justify-between items-center mb-2 px-2">
          <div className="flex items-center gap-2">
            <span className="font-bold">ID</span>
            <div className="w-6 h-6 bg-green-600 rounded-sm"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Payslip</span>
            <div className="w-6 h-6 bg-green-600 rounded-sm"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">KYC</span>
            <div className="w-6 h-6 bg-green-600 rounded-sm"></div>
          </div>
        </div>

        <div className="text-center text-sm font-medium mb-6">
          Documents need to update on : <span className="ml-2">20 June 2022</span>
        </div>

        {/* Update Button Row */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100">
            <Settings className="w-6 h-6" />
          </Button>
          <Button className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold uppercase tracking-wide h-12 shadow-md rounded-md">
            Update Documents
          </Button>
        </div>

        <div className="h-px bg-gray-300 w-full mb-6" />

        {/* Action Buttons */}
        <div className="space-y-4 flex-1">
          <Button className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold uppercase tracking-wide h-12 shadow-lg rounded-md border border-white/10">
            Request Nano Loan
          </Button>
          <Button className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold uppercase tracking-wide h-12 shadow-lg rounded-md border border-white/10">
            Apply for Term Loan
          </Button>
          <Button className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold uppercase tracking-wide h-12 shadow-lg rounded-md border border-white/10">
            Statement
          </Button>
          <Button className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold uppercase tracking-wide h-12 shadow-lg rounded-md border border-white/10">
            Credit Score History
          </Button>

          <Button 
            onClick={handleSignOut}
            className="w-full bg-brand-red hover:bg-red-700 text-white font-bold uppercase tracking-wide h-12 shadow-lg rounded-md mt-6"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}
