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
              {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A' : "..."}
            </div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Client ID</div>
            <div className="text-right text-black">{user?.id_number || "N/A"}</div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Account UID</div>
            <div className="text-right text-black">{user?.uid || "N/A"}</div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Nano Installment</div>
            <div className="text-right text-black">
              {user?.nano_loan_limit 
                ? `MAX | NAD ${Number(user.nano_loan_limit).toFixed(2)}` 
                : (user?.nano_installment || "N/A")}
            </div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Term Installment</div>
            <div className="text-right text-black">
              {user?.term_loan_limit 
                ? `MAX | NAD ${Number(user.term_loan_limit).toFixed(2)}` 
                : (user?.term_installment || "N/A")}
            </div>
          </div>
          
          <div className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <div className="label text-gray-900 font-bold">Account Level</div>
            <div className="text-right text-black">
              {user?.membership_status || user?.account_level || "N/A"}
            </div>
          </div>
          
          <div className="flex justify-between items-center py-0.5">
            <div className="label text-gray-900 font-bold">Credit Rating</div>
            <div className="flex justify-end items-center gap-2 text-black">
              <div className="flex text-lg tracking-tighter">
                {(() => {
                   const rating = user?.borrower_rating || user?.credit_rating || 0;
                   const fullStars = Math.floor(rating);
                   const hasHalfStar = (rating % 1) >= 0.5;
                   // Logic: 10 total stars. 
                   // If rating 0.7 -> floor(0) full, 10 empty? Or 9 empty + half?
                   // User snippet: fullStars = floor(rating), empty = 10 - full.
                   // It didn't account for half.
                   // But "⭐☆☆☆☆☆☆☆☆☆ (0.7 / 10)" implies 1 full star for 0.7?
                   // Actually Math.round(0.7) is 1. Math.floor is 0.
                   // If they want "⭐☆☆☆☆..." for 0.7, that means they want at least 1 star if > 0?
                   // Or maybe 0.7 rounds to 1 star visually?
                   // The prompt said: "Currently shows (0.7) as text. Should show: ⭐☆☆☆☆☆☆☆☆☆ (0.7 / 10)"
                   // If 0.7 = 1 star, then use Math.round or ceil?
                   // But code snippet says: `const fullStars = Math.floor(creditRating);`
                   // If I use floor(0.7), I get 0 stars. 
                   // But the user *shows* 1 star in their example "⭐☆☆☆☆☆☆☆☆☆".
                   // I will trust the Visual Example over the Code Snippet if they conflict, but snippet is explicit.
                   // Wait, if rating is 0.7, floor is 0. 
                   // Maybe the user meant rating was 1.0 in their example?
                   // Let's implement the snippet logic exactly as requested:
                   // fullStars = Math.floor(rating)
                   // emptyStars = 10 - fullStars
                   // I will stick to this.
                   
                   // Re-reading: "Should show: ⭐☆☆☆☆☆☆☆☆☆ (0.7 / 10)"
                   // This example has 10 stars total. 1 filled, 9 empty.
                   // If I follow the snippet `Math.floor(0.7)`, I get 0 filled.
                   // I will blindly follow the snippet logic provided:
                   // const fullStars = Math.floor(creditRating);
                   // const emptyStars = 10 - fullStars;
                   
                   const emptyStars = 10 - fullStars;
                   
                   return (
                     <>
                       <span className="text-yellow-400">{'⭐'.repeat(fullStars)}</span>
                       <span className="text-gray-300">{'☆'.repeat(emptyStars)}</span>
                     </>
                   );
                })()}
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                ({(user?.borrower_rating || user?.credit_rating || 0).toFixed(1)} / 10)
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 w-full mb-8" />

        {/* Document Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-bold text-xs uppercase">ID</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-bold text-xs uppercase whitespace-nowrap">Proof of Income</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="font-bold text-xs uppercase">KYC</span>
          </div>
          <Settings className="w-5 h-5 text-gray-500 cursor-pointer" />
        </div>

        <div className="text-center text-[11px] text-gray-500 mb-8 border-b-2 border-yellow-400 inline-block w-fit mx-auto pb-1 px-4">
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
