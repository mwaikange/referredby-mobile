import { api } from "@/lib/api";
import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import logoGroup from "@/assets/referredby-logo.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPin, setShowPin] = useState(false);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pin) return;

    setLoading(true);

    console.log('----------------------------------------');
    console.log('🔐 ATTEMPTING LOGIN');
    console.log('----------------------------------------');
    console.log('📧 Email:', email);
    
    try {
      console.log('🔑 Signing in with Supabase...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: pin,
      });

      if (error) {
        console.error('❌ Authentication failed:', error.message);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
        return;
      }

      if (!data.session) {
        console.error('❌ No session created');
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "No session returned",
        });
        return;
      }

      console.log('✅ Authentication successful!');
      console.log('👤 User ID:', data.user.id);

      console.log('📥 Fetching profile from API...');
      
      try {
        const userData = await api.getProfile();
        
        console.log('✅ Profile loaded from API!');
        console.log('👤 Name:', userData.first_name, userData.last_name);
        console.log('🆔 UID:', userData.uid);
        console.log('📱 Mobile:', userData.mobile);
        console.log('💰 Nano Limit:', userData.nano_loan_limit);
        console.log('💰 Term Limit:', userData.term_loan_limit);
        console.log('⭐ Rating:', userData.borrower_rating);

        console.log('🎯 Navigating to Profile...');
        setLocation('/profile');
        
        console.log('✅ Login complete!');
        console.log('----------------------------------------');
      } catch (profileError: any) {
        console.error('❌ Profile fetch failed:', profileError.message);
        toast({
          variant: "destructive",
          title: "Profile Load Failed",
          description: "Could not load profile data. Please try again.",
        });
        return;
      }

    } catch (error: any) {
      console.error('❌ ERROR:', error.message);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col pt-6">
        <div className="flex flex-col items-center mb-10">
          <img 
            src={logoGroup} 
            alt="ReferredBy Community Vetted Financing" 
            className="h-[60px] object-contain"
          />
        </div>

        <form onSubmit={handleLogin} className="flex-1 flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-black pl-1">
              Email Address
            </label>
            <Input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-100/50 border-gray-200 h-12 focus-visible:ring-brand-blue rounded-lg"
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
                className="bg-gray-100/50 border-gray-200 h-12 pr-10 focus-visible:ring-brand-blue rounded-lg"
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
            disabled={loading}
            className="w-full h-12 bg-[#0B0B3B] hover:bg-[#151555] text-white font-bold uppercase tracking-wide mt-2 rounded-lg shadow-lg flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Logging in..." : "LOGIN"}
          </Button>

          <div className="flex flex-col items-center gap-3 mt-6 text-sm text-center">
            <p className="text-gray-900">
              Not Yet Registered - <a href="#" className="text-blue-600 hover:underline">Click Here</a>
            </p>
            <p className="text-gray-900">
              Forgot Password - <a href="/forgot-password" className="text-blue-600 hover:underline">Click Here</a>
            </p>
            <p className="text-gray-900">
              Talk to an Agent - <a href="#" className="text-blue-600 hover:underline">Click Here</a>
            </p>
          </div>
        </form>

        <div className="mt-auto py-4 flex justify-center gap-4 text-xs text-brand-blue/80 font-medium">
          <a href="https://www.referredby.com.na/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms of Service</a>
          <span>|</span>
          <a href="https://www.referredby.com.na/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy Policy</a>
        </div>
        <div className="text-center text-[10px] text-gray-500 pb-2">
          Version 2.0.0.1
        </div>
      </div>
    </Layout>
  );
}
