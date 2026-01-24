import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoGroup from "@/assets/referredby-logo.png";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { api, type ReferralData, type PersonalData, type EmployerData } from "@/lib/api";

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

    try {
      await api.auth.verifyOtp(mobileNumber, otp, 'registration');
      
      const referral: ReferralData = {
        code: sessionStorage.getItem("registration_referral_code") || "",
        lending_society_id: sessionStorage.getItem("registration_lending_society_id") || "",
        lending_society_name: sessionStorage.getItem("registration_lending_society") || "",
        partner_id: sessionStorage.getItem("registration_partner_id") || "",
        staff_code: sessionStorage.getItem("registration_staff_code") || "",
        referral_owner_id: sessionStorage.getItem("registration_referral_owner_id") || "",
      };

      const personal: PersonalData = {
        full_names: sessionStorage.getItem("registration_fullnames") || "",
        surname: sessionStorage.getItem("registration_surname") || "",
        id_number: sessionStorage.getItem("registration_id_number") || "",
        mobile: sessionStorage.getItem("registration_mobile") || "",
        gender: sessionStorage.getItem("registration_gender") || "Male",
        region: sessionStorage.getItem("registration_region") || "",
        town: sessionStorage.getItem("registration_town") || "",
        street_name: sessionStorage.getItem("registration_street") || "",
        physical_address: sessionStorage.getItem("registration_address") || "",
        email: sessionStorage.getItem("registration_email") || "",
      };

      const employer: EmployerData = {
        employer_name: sessionStorage.getItem("registration_employer") || "",
        occupation: sessionStorage.getItem("registration_occupation") || "",
        office_number: sessionStorage.getItem("registration_office_number") || "",
        employee_code: sessionStorage.getItem("registration_employee_code") || "",
        nok_name: sessionStorage.getItem("registration_nok_name") || "",
        nok_surname: sessionStorage.getItem("registration_nok_surname") || "",
        nok_relationship: sessionStorage.getItem("registration_nok_relationship") || "",
        nok_mobile: sessionStorage.getItem("registration_nok_mobile") || "",
        po_box: sessionStorage.getItem("registration_po_box") || "",
        source_funds: sessionStorage.getItem("registration_source_funds") || "",
        source_income: sessionStorage.getItem("registration_source_income") || "",
      };

      const pin = sessionStorage.getItem("registration_pin") || "";
      
      const signupResult = await api.auth.signup({ referral, personal, employer, pin });
      
      sessionStorage.setItem("registration_user_id", signupResult.user_id);
      
      setLocation("/register-kyc");
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      await api.auth.sendOtp(mobileNumber, 'registration');
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    }
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
