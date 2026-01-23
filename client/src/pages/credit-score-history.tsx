import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function CreditScoreHistory() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0.5);
  const [scoreBreakdown, setScoreBreakdown] = useState({
    earlyPayments: 5,
    onTimePayments: 0,
    latePenalties: 0,
    referralBonus: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        if (profile?.star_rating) {
          setRating(profile.star_rating);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalScore = scoreBreakdown.earlyPayments + scoreBreakdown.onTimePayments - scoreBreakdown.latePenalties + scoreBreakdown.referralBonus;
  const scorePoints = Math.round(rating * 10);

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 10; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400 text-xl">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400 text-xl">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300 text-xl">☆</span>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center font-sans min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
          <p className="mt-4 text-sm text-gray-500">Loading score history...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col font-sans">
        <h1 className="text-center font-bold uppercase mb-6 tracking-tight text-[20px]">
          CREDIT SCORE HISTORY
        </h1>

        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Current Rating</p>
          <div className="flex justify-center items-center gap-1 mb-2">
            <span className="text-yellow-400 text-2xl">🏆</span>
            {renderStars()}
          </div>
          <div className="text-4xl font-bold text-[#00736e]">{rating}/10</div>
          <p className="text-sm text-gray-500 mt-1">Score: {scorePoints} points</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="font-bold mb-4">Score Breakdown</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm">Early Payments</span>
              </div>
              <span className="text-sm font-bold text-green-600">+{scoreBreakdown.earlyPayments} pts</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm">On-Time Payments</span>
              </div>
              <span className="text-sm font-bold text-green-600">+{scoreBreakdown.onTimePayments} pts</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm">Late Penalties</span>
              </div>
              <span className="text-sm font-bold text-red-600">{scoreBreakdown.latePenalties} pts</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-sm">Referral Bonus</span>
              </div>
              <span className="text-sm font-bold text-green-600">+{scoreBreakdown.referralBonus} pts</span>
            </div>
          </div>
          
          <div className="h-px bg-gray-200 my-4" />
          
          <div className="flex items-center justify-between">
            <span className="font-bold">Total Score</span>
            <span className="font-bold">{totalScore}/100</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
          <h2 className="font-bold mb-4">Rating History</h2>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium">Early Settlement</p>
              <p className="text-xs text-gray-400">14/12/25 - NL10133474</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">+5</p>
              <p className="text-xs text-gray-400">0.5</p>
            </div>
          </div>
        </div>

        <div className="pb-10">
          <Button 
            onClick={() => setLocation("/profile")}
            className="w-full bg-[#00736e] hover:bg-[#005955] text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
