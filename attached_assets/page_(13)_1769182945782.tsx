"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Star, StarHalf, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface RatingBreakdown {
  rating: number
  score: number
  rating_before_due: number
  rating_on_due: number
  rating_past_due: number
  rating_referral: number
}

interface RatingEvent {
  id: string
  type: string
  event_category: string
  points: number
  loan_id: string
  note: string
  created_at: string
  running_score: number
  running_rating: number
}

export default function CreditScoreHistoryPage() {
  const router = useRouter()
  const [breakdown, setBreakdown] = useState<RatingBreakdown | null>(null)
  const [events, setEvents] = useState<RatingEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCreditHistory()
  }, [])

  const loadCreditHistory = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push("/auth/login")
        return
      }

      // Get user record
      const { data: userData } = await supabase.from("users").select("id").eq("auth_user_id", user.id).single()

      if (!userData) {
        router.push("/auth/login")
        return
      }

      console.log("[v0] Credit Score - Auth user:", user.id)
      console.log("[v0] Credit Score - User record ID:", userData.id)

      // Get rating events history
      const { data: eventsData, error: eventsError } = await supabase
        .from("rating_events")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false })

      console.log("[v0] Rating events:", eventsData)
      console.log("[v0] Rating events error:", eventsError)

      if (eventsData && eventsData.length > 0) {
        setEvents(eventsData)

        let beforeDue = 0
        let onDue = 0
        let pastDue = 0
        let referral = 0

        eventsData.forEach((event) => {
          const category = (event.event_category || "").toLowerCase()
          const type = (event.type || "").toLowerCase()
          const points = event.points || 0

          // Check event_category first (preferred), then fall back to type
          if (
            category === "before_due" ||
            category === "rating_before_due" ||
            type === "before_due" ||
            type === "early_settlement" ||
            type === "settled_early" ||
            type.includes("early")
          ) {
            beforeDue += points
          } else if (
            category === "on_due" ||
            category === "rating_on_due" ||
            type === "on_due" ||
            type === "on_time" ||
            type === "on-time" ||
            type === "on_time_payment" ||
            type.includes("on-time") ||
            type.includes("on_time")
          ) {
            onDue += points
          } else if (
            category === "past_due" ||
            category === "rating_past_due" ||
            type === "past_due" ||
            type.includes("late") ||
            type.includes("default") ||
            type === "blocked"
          ) {
            pastDue += points
          } else if (category === "referral" || category === "rating_referral" || type.includes("referral")) {
            referral += points
          } else {
            // Fallback: categorize by points sign if no clear category
            // Positive points likely early/on-time, negative likely late
            if (points > 0) {
              beforeDue += points
            } else if (points < 0) {
              pastDue += points
            }
          }
        })

        // Total score = early + on_time + referral - ABS(late_penalties)
        const totalScore = Math.max(0, Math.min(100, beforeDue + onDue + referral - Math.abs(pastDue)))
        const rating = Math.min(10, Math.max(0, totalScore / 10))

        setBreakdown({
          rating: rating,
          score: totalScore,
          rating_before_due: beforeDue,
          rating_on_due: onDue,
          rating_past_due: pastDue,
          rating_referral: referral,
        })
      } else {
        // No events - default to zero
        setBreakdown({
          rating: 0,
          score: 0,
          rating_before_due: 0,
          rating_on_due: 0,
          rating_past_due: 0,
          rating_referral: 0,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to load credit history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
  }

  const getEventLabel = (type: string): string => {
    const labels: Record<string, string> = {
      before_due: "Early Payment",
      on_time: "On-Time Payment",
      on_due: "On-Time Payment",
      late_1_3: "Late (1-3 days)",
      late_4_7: "Late (4-7 days)",
      late_8_plus: "Late (8+ days)",
      settled_early: "Early Settlement",
      settled_late: "Late Settlement",
      referral_early: "Referral Early Pay",
      referral_on_time: "Referral On-Time",
      referral_late: "Referral Late Pay",
      referral_default: "Referral Default",
    }
    return labels[type] || type
  }

  const getPointsColor = (points: number): string => {
    if (points > 0) return "text-green-600"
    if (points < 0) return "text-red-600"
    return "text-gray-500"
  }

  const getPointsIcon = (points: number) => {
    if (points > 0) return <TrendingUp size={14} className="text-green-600" />
    if (points < 0) return <TrendingDown size={14} className="text-red-600" />
    return <Minus size={14} className="text-gray-400" />
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating - fullStars >= 0.5

    for (let i = 0; i < 10; i++) {
      if (i < fullStars) {
        // Full star
        stars.push(<Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        // Half star - use StarHalf icon
        stars.push(<StarHalf key={i} size={20} className="text-yellow-400 fill-yellow-400" />)
      } else {
        // Empty star
        stars.push(<Star key={i} size={20} className="text-white/30" />)
      }
    }
    return stars
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header Banner */}
      <div className="w-full h-14 flex-shrink-0 relative">
        <Image
          src="/images/banner-african-textile.png"
          alt="African textile banner"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-4">
          {/* Title */}
          <h1 className="text-xl font-bold text-center">CREDIT SCORE HISTORY</h1>

          {/* Current Rating Display */}
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm opacity-80 mb-1">Current Rating</p>
              <div className="flex justify-center items-center gap-1 mb-2">{renderStars(breakdown?.rating || 0)}</div>
              <p className="text-3xl font-bold">{(breakdown?.rating || 0).toFixed(1)}/10</p>
              <p className="text-sm opacity-80">Score: {breakdown?.score || 0} points</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h2 className="font-bold text-sm">Score Breakdown</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Early Payments
                </span>
                <span className="font-semibold text-green-600">+{breakdown?.rating_before_due || 0} pts</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  On-Time Payments
                </span>
                <span className="font-semibold text-blue-600">+{breakdown?.rating_on_due || 0} pts</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  Late Penalties
                </span>
                <span className="font-semibold text-red-600">{breakdown?.rating_past_due || 0} pts</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  Referral Bonus
                </span>
                <span className="font-semibold text-purple-600">
                  {(breakdown?.rating_referral || 0) >= 0 ? "+" : ""}
                  {breakdown?.rating_referral || 0} pts
                </span>
              </div>
            </div>

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center font-bold">
                <span>Total Score</span>
                <span>{breakdown?.score || 0}/100</span>
              </div>
            </div>
          </div>

          {/* Rating Events History */}
          <div className="space-y-2">
            <h2 className="font-bold text-sm">Rating History</h2>

            {events.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                No rating events yet. Your rating will update as you make loan payments.
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPointsIcon(event.points)}
                      <div>
                        <p className="text-xs font-semibold">{getEventLabel(event.type)}</p>
                        <p className="text-[10px] text-gray-500">
                          {formatDate(event.created_at)} • {event.loan_id || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${getPointsColor(event.points)}`}>
                        {event.points > 0 ? "+" : ""}
                        {event.points}
                      </p>
                      <p className="text-[10px] text-gray-400">→ {event.running_rating?.toFixed(1) || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Back Button */}
          <Button
            onClick={() => router.push("/profile")}
            className="w-full h-12 font-semibold text-white"
            style={{ backgroundColor: "#C41E3A" }}
          >
            BACK
          </Button>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="w-full h-14 flex-shrink-0 relative">
        <Image src="/images/banner-african-textile.png" alt="African textile banner" fill className="object-cover" />
      </div>
    </div>
  )
}
