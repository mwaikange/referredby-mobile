import { format } from "date-fns";
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
        console.log('📄 Profile Page - User Data:', profile);
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
            <div className="text-right text-black">
              {user?.account_name || (user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : "...")}
            </div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Client ID</div>
            <div className="text-right text-black">{user?.client_id || user?.id_number || "N/A"}</div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Account UID</div>
            <div className="text-right text-black">{user?.uid || "N/A"}</div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Nano Installment</div>
            <div className="text-right text-black">
              {user?.nano_installment || (user?.nano_loan_limit 
                ? `MAX | NAD ${Number(user.nano_loan_limit).toFixed(2)}` 
                : "N/A")}
            </div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Term Installment</div>
            <div className="text-right text-black">
              {user?.term_installment || (user?.term_loan_limit 
                ? `MAX | NAD ${Number(user.term_loan_limit).toFixed(2)}` 
                : "N/A")}
            </div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Account Level</div>
            <div className="text-right text-black">
              {user?.account_level || user?.membership_status || "N/A"}
            </div>
          </div>
          
          <div className="flex justify-between items-center py-0.5">
            <div className="label text-gray-900 font-bold">Credit Rating</div>
            <div className="flex justify-end items-center gap-2 text-black">
              <div className="flex text-lg tracking-tighter items-center">
                {(() => {
                   const rating = user?.borrower_rating || user?.credit_rating || 0;
                   const fullStars = Math.floor(rating);
                   const hasHalfStar = (rating % 1) >= 0.5;
                   // Logic: 10 total stars available.
                   // fullStars = filled stars
                   // hasHalfStar = one half-filled star
                   // emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0)
                   
                   const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);
                   
                   return (
                     <>
                       {/* Full Stars */}
                       {Array.from({ length: fullStars }).map((_, i) => (
                         <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                       ))}
                       
                       {/* Half Star - Custom SVG for half fill */}
                       {hasHalfStar && (
                         <div className="relative w-4 h-4">
                           <Star className="absolute w-4 h-4 text-gray-300" />
                           <div className="absolute w-[50%] h-full overflow-hidden">
                             <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                           </div>
                         </div>
                       )}
                       
                       {/* Empty Stars */}
                       {Array.from({ length: emptyStars }).map((_, i) => (
                         <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
                       ))}
                     </>
                   );
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 w-full mb-8" />

        {/* Document Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase">ID</span>
            <div className={`w-6 h-4 rounded-[2px] ${user?.documents?.national_id || user?.kyc_status?.id ? "bg-[#22C55E]" : "bg-gray-300"}`}></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase whitespace-nowrap">Proof of Income</span>
            <div className={`w-6 h-4 rounded-[2px] ${user?.documents?.payslip || user?.kyc_status?.proof_of_income ? "bg-[#22C55E]" : "bg-gray-300"}`}></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase">KYC</span>
            <div className={`w-6 h-4 rounded-[2px] ${user?.documents?.kyc || user?.kyc_status?.kyc ? "bg-[#22C55E]" : "bg-gray-300"}`}></div>
          </div>
          <Settings className="w-5 h-5 text-gray-500 cursor-pointer" />
        </div>

        <div className="text-center text-[11px] text-gray-500 mb-8 pb-1 px-4">
          Documents need to update on: {
            user?.document_deadline 
              ? format(new Date(user.document_deadline), "d MMMM yyyy") 
              : (user?.documents_update_due || "...")
          }
        </div>

        {/* Update Button */}
        <div className="mb-10">
          <Button 
            disabled={!user?.is_doc_update_needed}
            className={`w-full font-bold uppercase tracking-wide h-[54px] rounded-md transition-colors ${
              user?.is_doc_update_needed 
                ? "bg-[#0B0B3B] hover:bg-[#151555] text-white shadow-lg cursor-pointer" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
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
          <Button 
            onClick={() => setLocation("/term-loans")}
            className="w-full bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-md">
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
