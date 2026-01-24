import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordOtp() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const mobileNumber = params.get("mobile") || "";
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitOtp = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      if (otp === "123456") {
        setLocation(`/forgot-password-new-pin?mobile=${encodeURIComponent(mobileNumber)}`);
      } else {
        setError("Invalid or expired OTP");
      }
    }, 1000);
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-2">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <img 
              src="/referredby-logo.png" 
              alt="ReferredBy" 
              className="h-16 object-contain"
              data-testid="img-logo"
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-black mb-2">
                ENTER OTP
              </label>
              <Input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder=""
                className="h-12 bg-gray-50/50 border-gray-200 rounded-lg text-base text-center tracking-widest"
                maxLength={6}
                data-testid="input-otp"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center" data-testid="text-error">{error}</p>
            )}

            <Button
              onClick={handleSubmitOtp}
              disabled={isLoading}
              className="w-full h-12 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold tracking-wide rounded-lg"
              data-testid="button-submit-otp"
            >
              {isLoading ? "VALIDATING..." : "SUBMIT OTP"}
            </Button>

            <div className="text-center space-y-3 pt-4">
              <p className="text-sm text-gray-700">
                Not Yet Registered - <span className="text-blue-600 cursor-pointer" data-testid="link-register">Click Here</span>
              </p>
              <p className="text-sm text-gray-700">
                Already Registered - <span className="text-blue-600 cursor-pointer" data-testid="link-login" onClick={() => setLocation("/login")}>Click Here</span>
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
