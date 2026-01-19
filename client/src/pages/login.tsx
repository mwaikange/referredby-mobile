import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ENV } from "@/lib/env";
import logoGroup from "@assets/Group_2475_(2)_1768529192322.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPin, setShowPin] = useState(false);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    console.log('🧪 TESTING CONNECTIONS');
    console.log('----------------------------------------');
    
    // Test 1: Check environment variables
    console.log('1. Environment Variables:');
    console.log('SUPABASE_URL:', ENV.SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY present:', !!ENV.SUPABASE_ANON_KEY);
    console.log('API_BASE_URL:', ENV.API_BASE_URL);
    
    // Test 2: Test Supabase connection
    console.log('\n2. Testing Supabase REST API directly:');
    try {
      const testUrl = `${ENV.SUPABASE_URL}/rest/v1/`;
      console.log('Testing URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'apikey': ENV.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`,
        },
      });
      
      console.log('✅ Supabase REST API Status:', response.status);
      
    } catch (error: any) {
      console.error('❌ Supabase REST API Test Failed:', error.message);
    }
    
    // Test 3: Test backend API
    console.log('\n3. Testing Backend API:');
    try {
      const backendUrl = `${ENV.API_BASE_URL}/api/health`;
      console.log('Testing URL:', backendUrl);
      
      const response = await fetch(backendUrl);
      console.log('✅ Backend API Status:', response.status);
      
    } catch (error: any) {
      console.error('❌ Backend API Test Failed:', error.message);
    }
    
    console.log('----------------------------------------');
    alert('Check console for test results');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pin) return;

    setLoading(true);
    
    console.log("----------------------------------------");
    console.log("🔐 ATTEMPTING LOGIN");
    console.log("----------------------------------------");
    console.log(`Email: ${email}`);
    
    // First, test if we can reach Supabase at all
    console.log('0. Testing Supabase connectivity...');
    try {
      const testResponse = await fetch(`${ENV.SUPABASE_URL}/rest/v1/`, {
        headers: { 'apikey': ENV.SUPABASE_ANON_KEY },
      });
      console.log('✅ Supabase is reachable, status:', testResponse.status);
    } catch (testError: any) {
      console.error('❌ Cannot reach Supabase:', testError.message);
      alert('Network error: Cannot connect to authentication server. Please check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      // 1. Authenticate with Supabase
      console.log("1. Authenticating with Supabase...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pin,
      });

      if (error) {
        console.error("❌ Supabase Auth Failed:", error.message);
        throw error;
      }
      
      console.log("✅ Supabase Auth Successful");
      console.log("User ID:", data.user.id);
      console.log("Session:", data.session ? "Active" : "Missing");

      // 2. Fetch User Profile
      // Ideally we should check if profile exists, but we'll redirect for now
      setLocation("/profile");
      
    } catch (error: any) {
      console.error("❌ LOGIN ERROR:", error);
      console.log("----------------------------------------");
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={logoGroup} 
            alt="ReferredBy Community Vetted Financing" 
            className="w-full h-auto object-contain max-w-[320px]"
          />
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
            disabled={loading}
            className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold uppercase tracking-wide mt-2 rounded-md shadow-lg flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="flex flex-col items-center gap-3 mt-8 text-sm text-center">
            <button 
              type="button"
              onClick={testConnection}
              className="mt-5 p-2.5 bg-gray-600 text-white border-none rounded-md"
            >
              🧪 Test Connections
            </button>

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
