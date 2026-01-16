import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import logoIcon from "@assets/2_801_(1)_1768527810027.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPin, setShowPin] = useState(false);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && pin) {
      setLocation("/profile");
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col px-8 pt-8 pb-4">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={logoIcon} 
              alt="Logo" 
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold font-heading tracking-tight flex items-baseline gap-1">
                ReferredBy <span className="text-sm font-normal align-top">TM</span>
              </h1>
            </div>
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-black">
            Community Vetted Financing
          </p>
          <div className="w-full h-px bg-gray-300 mt-6" />
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="flex-1 flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-black pl-1">
              Email Address
            </label>
            <Input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-100/50 border-gray-200 h-12 focus-visible:ring-brand-blue"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-black pl-1">
              Enter PIN
            </label>
            <div className="relative">
              <Input 
                type={showPin ? "text" : "password"} 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="bg-gray-100/50 border-gray-200 h-12 pr-10 focus-visible:ring-brand-blue"
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold uppercase tracking-wide mt-2 rounded-md shadow-lg"
          >
            Login
          </Button>

          <div className="flex flex-col items-center gap-3 mt-8 text-sm text-center">
            <p className="text-gray-900">
              Not Yet Registered - <a href="#" className="text-blue-600 hover:underline">Click Here</a>
            </p>
            <p className="text-gray-900">
              Forgot Password - <a href="#" className="text-blue-600 hover:underline">Click Here</a>
            </p>
            <p className="text-gray-900">
              Talk to an Agent - <a href="#" className="text-blue-600 hover:underline">Click Here</a>
            </p>
          </div>
        </form>

        <div className="mt-auto py-4 flex justify-center gap-4 text-xs text-brand-blue/80 font-medium">
          <a href="#" className="hover:underline">Terms of Service</a>
          <span>|</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
        <div className="text-center text-[10px] text-gray-500 pb-2">
          Version 2.0.0.1
        </div>
      </div>
    </Layout>
  );
}
