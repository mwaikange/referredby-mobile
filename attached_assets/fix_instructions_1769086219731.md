# EXACT FIX FOR EXPO CONFIGURATION ERROR

## Step 1: Delete the ROOT app.json (it's wrong and interfering)
The root app.json has the wrong project ID and no env vars.
EAS is reading THIS file instead of mobile/app.config.js

**Action**: Delete or rename `/app.json` to `app.json.backup`

## Step 2: Fix eas.json env variable syntax

Current (WRONG):
```json
"env": {
  "EXPO_PUBLIC_SUPABASE_URL": "${EXPO_PUBLIC_SUPABASE_URL}"
}
```

The ${...} syntax doesn't work in EAS. Remove the env section entirely.
EAS will automatically inject EXPO_PUBLIC_* variables from your dashboard.

## Step 3: Update mobile/app.config.js to add diagnostic logging

Add this at the TOP of the file to confirm it's running:

```javascript
console.log("🚀 app.config.js is EXECUTING");
console.log("📍 Build env check:", {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ? "✅ Present" : "❌ Missing",
  key: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? "✅ Present" : "❌ Missing",
  api: process.env.EXPO_PUBLIC_API_BASE_URL ? "✅ Present" : "❌ Missing"
});

export default {
  expo: {
    // ... rest of config
  }
};
```

## Step 4: Build from the /mobile directory

You MUST run eas build from inside the /mobile folder:

```bash
cd mobile
eas build -p android --profile preview --clear-cache
```

NOT from the project root.

## Why This Fixes It

1. Deleting root app.json forces EAS to use mobile/app.config.js
2. mobile/app.config.js has the correct project ID (6efe1f9d...)
3. mobile/app.config.js injects env vars into extra object
4. EAS automatically provides EXPO_PUBLIC_* vars without needing eas.json env section
5. Building from /mobile directory ensures correct config is used

## Expected Build Log Output

You should see in EAS build logs:
```
🚀 app.config.js is EXECUTING
📍 Build env check: { url: '✅ Present', key: '✅ Present', api: '✅ Present' }
```

If you see this, the config is working correctly.
