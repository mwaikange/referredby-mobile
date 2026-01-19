import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Star, Loader2 } from "lucide-react";
import { api, type UserProfile } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await api.getProfile();
        setUser(profile);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load profile",
        });
        // If unauthenticated, redirect to login
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setLocation("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setLocation, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation("/login");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center font-sans min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          <p className="mt-4 text-sm text-gray-500">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="font-bold font-heading uppercase tracking-tight">Profile</h1>
          <Bell className="w-8 h-8 text-red-500" />
        </div>

        {/* Profile Info Grid */}
        <div className="flex flex-col gap-1.5 mb-6">
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Account Name</div>
            <div className="text-right text-black">{user ? `${user.last_name} ${user.first_name}` : "..."}</div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Client ID</div>
            <div className="text-right text-black">{user?.id_number || "..."}</div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Account UID</div>
            <div className="text-right text-black">{user?.uid || "..."}</div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Nano Installment</div>
            <div className="text-right text-black">{user?.nano_installment || "..."}</div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Term Installment</div>
            <div className="text-right text-black">{user?.term_installment || "..."}</div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Account Level</div>
            <div className="text-right text-black">{user?.account_level || "..."}</div>
          </div>
          
          <div className="flex justify-between items-center py-0.5">
            <div className="label text-gray-900 font-bold">Credit Rating</div>
            <div className="flex justify-end gap-0.5 text-black">
               {Array.from({ length: 10 }).map((_, i) => (
                 <Star 
                   key={i} 
                   className={`w-4 h-4 ${i < (user?.credit_rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                 />
               ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 w-full mb-8" />

        {/* Document Status */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase">ID</span>
            <div className={`w-6 h-6 rounded-sm ${user?.kyc_status?.id ? "bg-green-500" : "bg-gray-300"}`}></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase whitespace-nowrap">Proof of Income</span>
            <div className={`w-6 h-6 rounded-sm ${user?.kyc_status?.proof_of_income ? "bg-green-500" : "bg-gray-300"}`}></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase">KYC</span>
            <div className={`w-6 h-6 rounded-sm ${user?.kyc_status?.kyc ? "bg-green-500" : "bg-gray-300"}`}></div>
          </div>
          <Settings className="w-6 h-6 text-gray-500" />
        </div>

        <div className="text-center text-[11px] text-gray-500 mb-8">
          Documents need to update on: {user?.documents_update_due || "..."}
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
          <Button 
            onClick={() => setLocation("/interest-confirmation")}
            className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md"
          >
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
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}
