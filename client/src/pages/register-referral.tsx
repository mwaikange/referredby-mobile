import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoGroup from "@/assets/referredby-logo.png";
import { Clipboard } from "lucide-react";
import { api } from "@/lib/api";

export default function RegisterReferral() {
  const [, setLocation] = useLocation();
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (!referralCode.trim()) {
      setError("Please enter a referral code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await api.referrals.validate(referralCode.trim());
      
      sessionStorage.setItem("registration_referral_code", data.code || referralCode);
      sessionStorage.setItem("registration_lending_society_id", data.lending_society_id);
      sessionStorage.setItem("registration_lending_society", data.lending_society_name);
      sessionStorage.setItem("registration_partner_id", data.partner_id);
      sessionStorage.setItem("registration_staff_code", data.staff_code);
      sessionStorage.setItem("registration_referral_owner_id", data.referral_owner_id);
      
      setLocation("/register-link-community");
    } catch (err: any) {
      setError(err.message || "Invalid or expired referral code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-2">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <img 
              src={logoGroup} 
              alt="ReferredBy Community Vetted Financing" 
              className="h-[60px] object-contain"
              data-testid="img-logo"
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-black mb-2">
                REFERRAL CODE
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Clipboard size={18} />
                </div>
                <Input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder=""
                  className="h-12 bg-gray-50/50 border-2 border-yellow-400 rounded-lg text-base pl-10"
                  data-testid="input-referral-code"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center" data-testid="text-error">{error}</p>
            )}

            <Button
              onClick={handleSignUp}
              disabled={isLoading}
              className="w-full h-12 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold tracking-wide rounded-lg"
              data-testid="button-signup"
            >
              {isLoading ? "VALIDATING..." : "SIGN UP"}
            </Button>

            <div className="text-center space-y-3 pt-4">
              <p className="text-sm text-gray-700">
                Back to Login - <span className="text-blue-600 cursor-pointer" data-testid="link-login" onClick={() => setLocation("/login")}>Click Here</span>
              </p>
              <p className="text-sm text-gray-700">
                Forgot Password - <span className="text-blue-600 cursor-pointer" data-testid="link-forgot" onClick={() => setLocation("/forgot-password")}>Click Here</span>
              </p>
              <p className="text-sm text-gray-700">
                Talk to an Agent - <span className="text-blue-600 cursor-pointer" data-testid="link-agent">Click Here</span>
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="text-blue-500/80" data-testid="link-terms">Terms of Service</span>
              <span className="text-blue-500/80">|</span>
              <span className="text-blue-500/80" data-testid="link-privacy">Privacy Policy</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-2" data-testid="text-version">Version 2.0.0.1</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
