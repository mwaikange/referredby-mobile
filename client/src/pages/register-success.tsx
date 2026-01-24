import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import logoGroup from "@/assets/referredby-logo.png";

export default function RegisterSuccess() {
  const [, setLocation] = useLocation();

  const handleGoToLogin = () => {
    sessionStorage.clear();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="h-16 overflow-hidden">
        <img 
          src="/header-pattern.png" 
          alt="" 
          className="w-full h-16 object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <img 
          src={logoGroup} 
          alt="ReferredBy" 
          className="h-12 object-contain mb-8"
          data-testid="img-logo"
        />

        <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-4" data-testid="text-title">
          Registration Successful!
        </h1>

        <p className="text-sm text-gray-600 text-center mb-8 max-w-xs">
          Your application has been submitted successfully. Admin will verify your documents and update you via SMS or Email.
        </p>

        <Button
          onClick={handleGoToLogin}
          className="w-full max-w-xs bg-[#0B0B3B] hover:bg-[#1a1a5c] text-white font-bold py-3 rounded-lg"
          data-testid="button-go-to-login"
        >
          GO TO LOGIN
        </Button>
      </div>

      <div className="h-16 overflow-hidden">
        <img 
          src="/header-pattern.png" 
          alt="" 
          className="w-full h-16 object-cover rotate-180"
        />
      </div>
    </div>
  );
}
