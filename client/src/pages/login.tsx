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
    console.log('🧪 TESTING BACKEND CONNECTION');
    console.log('----------------------------------------');
    
    console.log('Environment Variables:');
    console.log('API_BASE_URL:', ENV.API_BASE_URL);
    console.log('SUPABASE_URL:', ENV.SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY present:', !!ENV.SUPABASE_ANON_KEY);
    
    console.log('\nTesting Backend API Health:');
    try {
      // Test if backend is reachable
      const testUrl = `${ENV.API_BASE_URL}/api/auth/login`;
      console.log('Testing URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', pin: '0000' }),
      });
      
      console.log('✅ Backend is reachable');
      console.log('Status:', response.status);
      console.log('(401/400 is expected for wrong credentials)');
      
    } catch (error: any) {
      console.error('❌ Backend connection failed:', error.message);
    }
    
    console.log('----------------------------------------');
    alert('Check console for test results');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pin) return;

    setLoading(true);

    console.log('----------------------------------------');
    console.log('🔐 ATTEMPTING LOGIN (Direct Supabase Auth)');
    console.log('----------------------------------------');
    console.log('📧 Email:', email);
    
    try {
      // Authenticate directly with Supabase
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
      console.log('🎫 Access token received');
      console.log('👤 User ID:', data.user.id);

      // Fetch profile from backend API
      console.log('📥 Fetching profile data...');
      
      const profileResponse = await fetch(`${ENV.API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Profile response:', profileResponse.status);

      if (!profileResponse.ok) {
        console.error('❌ Profile fetch failed');
        toast({
          variant: "destructive",
          title: "Profile Error",
          description: "Logged in but could not load profile",
        });
        return;
      }

      const profileData = await profileResponse.json();
      const userData = profileData.user || profileData;
      
      console.log('✅ Profile loaded');
      console.log('👤 Name:', userData.first_name, userData.last_name);
      console.log('🎯 Navigating to Profile...');

      // Navigate to profile page
      setLocation('/profile');
      
      console.log('✅ Login complete!');
      console.log('----------------------------------------');

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
