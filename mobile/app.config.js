console.log("🚀 app.config.js IS EXECUTING");
console.log("📍 Build-time environment check:", {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ? "✅ Present" : "❌ Missing",
  key: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? "✅ Present" : "❌ Missing",
  api: process.env.EXPO_PUBLIC_API_BASE_URL ? "✅ Present" : "❌ Missing"
});

export default {
  expo: {
    name: "ReferredBy",
    slug: "referredby-mobile",
    owner: "referredby",
    version: "1.0.9",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.referredby.mobile"
    },
    android: {
      package: "com.referredby.mobile",
      versionCode: 9,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-secure-store",
      "expo-image-picker",
      "expo-document-picker"
    ],
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "https://appv2.referredby.com.na",
      eas: {
        projectId: "6efe1f9d-89da-454c-95b1-fd337beb7730"
      }
    }
  }
};
