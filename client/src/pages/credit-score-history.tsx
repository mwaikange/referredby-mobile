import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

export default function CreditScoreHistory() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0.5);
  const [scoreBreakdown, setScoreBreakdown] = useState({
    earlyPayments: 5,
    onTimePayments: 0,
    latePenalties: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await api.getProfile();
        console.log('📥 Fetching credit score for user:', profile.id);
        
        if (profile?.star_rating !== undefined) {
          setRating(profile.star_rating);
        }
        
        // Try to fetch rating events/breakdown from profile data
        const profileData = profile as any;
        if (profileData?.score_breakdown) {
          setScoreBreakdown({
            earlyPayments: profileData.score_breakdown.early_payments || 0,
            onTimePayments: profileData.score_breakdown.on_time_payments || 0,
            latePenalties: profileData.score_breakdown.late_penalties || 0,
          });
        } else if (profileData?.borrower_rating !== undefined) {
          // Calculate approximate breakdown from rating
          const ratingValue = profile.borrower_rating || profile.star_rating || 0;
          setScoreBreakdown({
            earlyPayments: Math.round(ratingValue * 2),
            onTimePayments: Math.round(ratingValue * 3),
            latePenalties: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalScore = scoreBreakdown.earlyPayments + scoreBreakdown.onTimePayments - Math.abs(scoreBreakdown.latePenalties);
  const scorePoints = Math.round(rating * 10);

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const decimal = rating - fullStars;
    const hasHalfStar = decimal >= 0.25 && decimal < 0.75;
    const roundUp = decimal >= 0.75;
    
    for (let i = 0; i < 10; i++) {
      if (i < fullStars || (i === fullStars && roundUp)) {
        stars.push(<span key={i} style={{ color: '#facc15', fontSize: '20px' }}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} style={{ position: 'relative', display: 'inline-block', width: '20px', fontSize: '20px' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>☆</span>
            <span style={{ position: 'absolute', left: 0, top: 0, width: '50%', overflow: 'hidden', color: '#facc15' }}>★</span>
          </span>
        );
      } else {
        stars.push(<span key={i} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '20px' }}>☆</span>);
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

        {/* Current Rating - Green Card */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-xl p-6 mb-6 text-center text-white">
          <p className="text-sm opacity-80 mb-2">Current Rating</p>
          <div className="flex justify-center items-center gap-0.5 mb-2">
            <span style={{ color: '#facc15', fontSize: '18px', marginRight: '4px' }}>⚡</span>
            {renderStars()}
          </div>
          <div className="text-4xl font-bold">{rating}/10</div>
          <p className="text-sm opacity-80 mt-1">Score: {scorePoints} points</p>
        </div>

        {/* Score Breakdown */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <h2 className="font-bold mb-4 text-sm">Score Breakdown</h2>
          
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
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-sm">On-Time Payments</span>
              </div>
              <span className="text-sm font-bold text-blue-600">+{scoreBreakdown.onTimePayments} pts</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm">Late Penalties</span>
              </div>
              <span className="text-sm font-bold text-red-600">{scoreBreakdown.latePenalties} pts</span>
            </div>
          </div>
          
          <div className="h-px bg-gray-200 my-4" />
          
          <div className="flex items-center justify-between">
            <span className="font-bold">Total Score</span>
            <span className="font-bold">{totalScore}/100</span>
          </div>
        </div>

        {/* Rating History */}
        <div className="mb-6">
          <h2 className="font-bold mb-3 text-sm">Rating History</h2>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp size={16} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium">Early Settlement</p>
                  <p className="text-xs text-gray-400">30/12/25 • NL52886717</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">+5</p>
                <p className="text-xs text-gray-400">→ N/A</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-6">
          <Button 
            onClick={() => setLocation("/profile")}
            className="w-full text-white font-bold uppercase tracking-wide h-[54px] shadow-lg rounded-lg"
            style={{ backgroundColor: "#C41E3A" }}
          >
            BACK
          </Button>
        </div>
      </div>
    </Layout>
  );
}
