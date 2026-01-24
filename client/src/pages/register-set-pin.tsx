import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoGroup from "@/assets/referredby-logo.png";

export default function RegisterSetPin() {
  const [, setLocation] = useLocation();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const mobile = sessionStorage.getItem("registration_mobile") || "+264XXXXXXXXX";
    setMobileNumber(mobile);
  }, []);

  const handleContinue = () => {
    if (!pin || pin.length < 4) {
      setError("PIN must be 4-6 digits");
      return;
    }

    if (pin.length > 6) {
      setError("PIN must be 4-6 digits");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    sessionStorage.setItem("registration_pin", pin);

    setTimeout(() => {
      setIsLoading(false);
      setLocation("/register-otp");
    }, 1000);
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-2">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <img 
              src={logoGroup} 
              alt="ReferredBy Community Vetted Financing" 
              className="h-[50px] object-contain"
              data-testid="img-logo"
            />
          </div>

          <h2 className="text-lg font-bold text-center mb-2" data-testid="text-title">Set Your PIN</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            OTP will be sent to: <span className="text-blue-600" data-testid="text-mobile">{mobileNumber}</span>
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Enter PIN (4-6 Digits)</label>
              <Input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
                maxLength={6}
                data-testid="input-pin"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Confirm PIN</label>
              <Input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-10 bg-gray-100 border-gray-200 rounded text-sm"
                maxLength={6}
                data-testid="input-confirm-pin"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center" data-testid="text-error">{error}</p>
            )}

            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full h-12 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold tracking-wide rounded-lg"
              data-testid="button-continue"
            >
              {isLoading ? "SENDING OTP..." : "CONTINUE"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
