import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoGroup from "@/assets/referredby-logo.png";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default function RegisterOtp() {
  const [, setLocation] = useLocation();
  const [otp, setOtp] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const mobile = sessionStorage.getItem("registration_mobile") || "+264XXXXXXXXX";
    setMobileNumber(mobile);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

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
        sessionStorage.clear();
        setLocation("/login");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    }, 1500);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setResendTimer(60);
    setCanResend(false);
  };

  const handleBack = () => {
    setLocation("/register-set-pin");
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-2">
        <div className="flex justify-center mb-4">
          <img 
            src={logoGroup} 
            alt="ReferredBy Community Vetted Financing" 
            className="h-[50px] object-contain"
            data-testid="img-logo"
          />
        </div>

        <div className="flex items-center mb-4">
          <button 
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800"
            data-testid="button-back-arrow"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-center flex-1 mr-5" data-testid="text-title">ENTER OTP</h2>
        </div>

        <p className="text-sm text-center mb-6">
          An OTP has been sent to <span className="font-bold text-blue-600" data-testid="text-mobile">{mobileNumber}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Enter OTP</label>
            <Input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-12 bg-gray-100 border-gray-200 rounded text-base text-center tracking-widest"
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
            className="w-full h-12 bg-[#00736e] hover:bg-[#005a56] text-white font-bold tracking-wide rounded-lg"
            data-testid="button-submit-otp"
          >
            {isLoading ? "CREATING ACCOUNT..." : "SUBMIT OTP"}
          </Button>

          <Button
            onClick={handleResendOtp}
            disabled={!canResend}
            className={`w-full h-12 font-bold tracking-wide rounded-lg flex items-center justify-center gap-2 ${
              canResend 
                ? "bg-[#8B4513] hover:bg-[#6d3610] text-white" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            data-testid="button-resend-otp"
          >
            <RotateCcw size={18} />
            {canResend ? "RESEND OTP" : `RESEND OTP (${resendTimer}s)`}
          </Button>

          <p className="text-xs text-gray-500 text-center">OTP valid for 10 minutes</p>
        </div>
      </div>
    </Layout>
  );
}
