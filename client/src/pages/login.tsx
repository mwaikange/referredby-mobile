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
    console.log('🔐 ATTEMPTING LOGIN (via Backend API)');
    console.log('----------------------------------------');
    console.log('📧 Email:', email);
    
    try {
      // Step 1: Call backend login (sets auth cookies)
      const loginUrl = `${ENV.API_BASE_URL}/api/auth/login`;
      console.log('🔗 Calling:', loginUrl);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies
        body: JSON.stringify({
          email: email,
          pin: pin,
        }),
      });

      console.log('📡 Backend response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Login failed:', errorText);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid credentials",
        });
        return;
      }

      const authData = await response.json();
      console.log('📦 Backend response:', authData);

      if (!authData.success) {
        console.error('❌ Login not successful');
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Login failed",
        });
        return;
      }

      console.log('✅ Backend login successful (cookies set)');

      // Step 2: Try to get the session from Supabase client (it should pick up the cookies)
      console.log('🔄 Retrieving session from Supabase...');
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session retrieval error:', sessionError.message);
      }
      
      console.log('Session data:', sessionData);
      console.log('Session present:', !!sessionData.session);
      
      if (sessionData?.session?.access_token) {
        console.log('✅ Session retrieved from Supabase');
        console.log('🎫 Access token:', sessionData.session.access_token.substring(0, 20) + '...');
        
        // Step 3: Fetch user profile
        console.log('🔗 Fetching user profile...');
        const profileUrl = `${ENV.API_BASE_URL}/api/users/me`;
        
        const profileResponse = await fetch(profileUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        console.log('📡 Profile response status:', profileResponse.status);

        if (!profileResponse.ok) {
          const profileError = await profileResponse.text();
          console.error('❌ Profile fetch failed:', profileError);
          toast({
            variant: "destructive",
            title: "Profile Error",
            description: "Login successful but failed to load profile",
          });
          return;
        }

        const profileData = await profileResponse.json();
        console.log('✅ Profile data received');
        const user = profileData.user || profileData.data?.user || profileData;
        console.log('User:', user?.first_name, user?.last_name);

        // Step 4: Navigate to profile page
        console.log('🎯 Navigating to Profile page...');
        setLocation("/profile");
        
      } else {
        // Fallback: Try direct Supabase authentication
        console.log('⚠️ No session from cookies, trying direct Supabase auth...');
        
        const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: pin,
        });
        
        if (authError) {
          console.error('❌ Direct Supabase auth failed:', authError.message);
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Could not establish session",
          });
          return;
        }
        
        console.log('✅ Direct Supabase auth successful');
        
        // Fetch profile
        const profileUrl = `${ENV.API_BASE_URL}/api/users/me`;
        const profileResponse = await fetch(profileUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authResult.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        const profileData = await profileResponse.json();
        
        setLocation("/profile");
      }
      
      console.log('----------------------------------------');

    } catch (error: any) {
      console.error('❌ LOGIN ERROR:', error);
      console.error('Error message:', error.message);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: error.message || 'Network error',
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
