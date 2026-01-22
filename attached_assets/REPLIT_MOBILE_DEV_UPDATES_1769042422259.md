# Mobile App API Updates - Critical Implementation Notes

**Date:** January 22, 2026  
**For:** Replit Mobile Developer  
**Priority:** HIGH - Breaking Changes

---

## 🚨 CRITICAL UPDATES TO IMPLEMENT

### 1. PROFILE PAGE (`/profile` or similar)

#### API Endpoint Change
**OLD:** Multiple Supabase queries to fetch user data  
**NEW:** Single API call to `/api/users/me`

#### Implementation Required:

```typescript
// On Profile Page Load
const response = await fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${userToken}` // Use stored auth token
  }
});
const data = await response.json();

// data.user now contains ALL profile information
```

#### Updated Response Structure:
```json
{
  "success": true,
  "user": {
    "account_name": "DOBSON ANDRE",           // Full name
    "client_id": "8503029996",                // ID number
    "uid": "RB1015",                          // Account UID
    "nano_installment": "MAX | NAD 2000.00",  // Pre-formatted
    "term_installment": "MAX | NAD 500.00",   // Pre-formatted
    "account_level": "NL5 / TL0",             // Pre-formatted
    "borrower_rating": 1.0,                   // 0-10 scale (display as stars)
    "membership_status": "AP2",
    
    // ✅ NEW: Document Status (for green/grey boxes)
    "documents": {
      "national_id": true,    // Green box if true, grey if false
      "payslip": true,        // Green box if true, grey if false
      "kyc": true            // Green box if true, grey if false
    },
    
    // ✅ NEW: Document Deadline
    "document_deadline": "2026-06-11T00:00:00.000Z",  // Format: "11 June 2026"
    "is_doc_update_needed": false,  // Enable UPDATE DOCUMENTS button if true
    
    // ✅ NEW: Loan Access Control
    "loan_access": {
      "nano": true,
      "term": true,
      "term_max_months": 12,
      "term_min_months": 1
    },
    "nano_loan_enabled": true,  // Enable REQUEST NANO LOAN button
    "term_loan_enabled": true   // Enable APPLY FOR TERM LOAN button
  }
}
```

#### UI Changes Required:

1. **Credit Rating Stars:**
   - Display `borrower_rating` as filled stars (e.g., 1.0 = 1 filled star out of 10)
   
2. **Document Status Boxes (ID, Proof of Income, KYC):**
   - Green background (#22C55E) if `documents.national_id/payslip/kyc` is **true**
   - Grey background (#D1D5DB) if **false**

3. **Document Deadline:**
   - Format `document_deadline` as "DD Month YYYY" (e.g., "11 June 2026")
   - Display text: "Documents need to update on: 11 June 2026"

4. **UPDATE DOCUMENTS Button:**
   - Enabled (dark color) if `is_doc_update_needed` is **true**
   - Disabled (grey) if **false**

5. **REQUEST NANO LOAN Button:**
   - Check BOTH conditions:
     - `isApproved` (membership_status is AP2, AA, AP)
     - `nano_loan_enabled` (from loan_access)
   - Disabled if EITHER condition is false

6. **APPLY FOR TERM LOAN Button:**
   - Check BOTH conditions:
     - `isApproved` (membership_status is AP2, AA, AP)
     - `term_loan_enabled` (from loan_access)
   - Disabled if EITHER condition is false

---

### 2. INTEREST CONFIRMATION PAGE (`/loans/interest-confirmation`)

#### API Endpoint
**GET** `/api/mobile/interest-confirmation?type=nano` or `?type=term`

#### Updated Response Structure:

**Header Box (Teal Background):**
```json
{
  "referring_partner": "nastya peno",      // Display as-is
  "lender": "Destiny Group Pty LTD",       // This is the Portfolio Holder
  "lending_society": "Kayla Industries",   // Display as-is
  "borrower": "DOBSON ANDRE"              // This is the logged-in user
}
```

#### 🔥 CRITICAL: Different Display Logic for Nano vs Term

**FOR NANO LOANS (type=nano):**

Show these sections ONLY:
1. **Portfolio Interest Rate (PIR)**
   - Display: "Base Rate: {pir_percent}%"
   - Example: "Base Rate: 28.00%"

2. **Subsidized Interest Rate (SIR)** (if `sir_enabled` is true)
   - Display: "Subsidy Enabled: {sir_percent}%"
   - Display: "Policy: Applies After PIR" (if sir_policy is "after_pir")
   - Green background box

3. **DO NOT SHOW:**
   - ❌ Individual Interest Rate (IIR) section
   - ❌ Rating tiers
   - ❌ Term Loan Base Rate

**FOR TERM LOANS (type=term):**

Show these sections ONLY:
1. **Term Loan Base Rate**
   - Display: "Base Rate: {iir_base}%"
   - Example: "Base Rate: 24.75%"
   - This replaces "Portfolio Interest Rate (PIR)"

2. **Individual Interest Rate (IIR)**
   - Display three tiers:
     - "0-3 Stars (Fair): {iir_rates.fair}%"
     - "4-6 Stars (Good): {iir_rates.good}%"
     - "7-10 Stars (Excellent): {iir_rates.excellent}%"

3. **DO NOT SHOW:**
   - ❌ Portfolio Interest Rate (PIR) section
   - ❌ Subsidized Interest Rate (SIR) section

#### Fees Section (Both Loan Types):
```json
"fees": {
  "processing": 32,   // Display: "Processing Fee: N$ 32"
  "late_fee": 5       // Display: "Late Fee (Accumulating Arrears): 5%"
}
```

#### Loan Limits Section:
```json
"progression_levels": {
  "nano": {
    "L1": 2000,   // Level 1: N$ 2000.00
    "L2": 4200,   // Level 2: N$ 4200.00
    "L3": 8700    // Level 3: N$ 8700.00
  },
  "term": {
    "L1": 13000,  // Level 1: N$ 13000.00
    "L2": 15000,  // Level 2: N$ 15000.00
    "L3": 20000   // Level 3: N$ 20000.00
  }
}
```

**Display Logic:**
- For nano loans: Show `progression_levels.nano.L1`, `L2`, `L3`
- For term loans: Show `progression_levels.term.L1`, `L2`, `L3`

#### Your Applicable Rate Box (Yellow Background):
```json
{
  "user_star_rating": 0,              // Display: "Your Rating: 0"
  "user_tier_label": "Fair (0-3)",    // Display: "Your Tier: Fair (0-3)"
  "rate_basis": "PIR+SIR",           // Display: "Interest Basis: PIR+SIR" or "IIR"
  "user_effective_rate": 24.75       // Display: "Your Final Interest Rate: 24.75%" (large, bold)
}
```

#### PROCEED Button Logic:
```json
{
  "can_proceed": true,         // Enable button ONLY if true
  "has_active_loan": false     // If true, show error: "You have an active loan"
}
```

**Button States:**
- Enabled (dark blue): `can_proceed === true`
- Disabled (grey): `can_proceed === false`

If `has_active_loan` is true, show error message:
> "You have an active loan. Please settle it before applying for a new one."

---

### 3. LOAN REQUEST PAGE (`/loans/apply`)

#### API Endpoint
**GET** `/api/mobile/loan-request?type=nano&amount={amount}` or `?type=term&amount={amount}`

#### Account Level & Loan Max Display:

The API returns:
```json
{
  "current_level": 1,        // Extracted from latest loan_id (NL1, NL2, TL1, etc.)
  "min_amount": 300,
  "max_amount": 2000         // From progression_levels.nano.L1 or .term.L1
}
```

**Display:**
- Account Level: "NL{current_level}" for nano or "TL{current_level}" for term
- LOAN MAX: Display `max_amount` (e.g., "N$ 2000")
- Slider range: `min_amount` to `max_amount`

---

## 📋 SUMMARY OF KEY CHANGES

### What Changed:
1. ✅ Profile page now uses `/api/users/me` instead of direct Supabase queries
2. ✅ Document status boxes driven by API response (green/grey logic)
3. ✅ Loan access flags (`nano_loan_enabled`, `term_loan_enabled`) control button states
4. ✅ Interest confirmation displays differently for nano vs term loans
5. ✅ Term loans show "Term Loan Base Rate" instead of "Portfolio Interest Rate"
6. ✅ Progression levels now return BOTH nano and term (app selects which to display)
7. ✅ PROCEED button controlled by `can_proceed` flag (checks loan_access + active loans)

### What Stayed the Same:
- Authentication flow (session cookies/Bearer tokens)
- OTP verification process
- Document upload process
- Loan submission process

---

## 🔧 TESTING CHECKLIST

- [ ] Profile page loads and displays all fields correctly
- [ ] Document boxes show correct colors (green/grey) based on status
- [ ] Credit rating displays as stars (0-10)
- [ ] REQUEST NANO LOAN button disabled if nano_loan_enabled is false
- [ ] APPLY FOR TERM LOAN button disabled if term_loan_enabled is false
- [ ] Interest confirmation for nano shows PIR + SIR (no IIR)
- [ ] Interest confirmation for term shows Term Loan Base Rate + IIR (no PIR/SIR)
- [ ] Progression levels display correct amounts for L1, L2, L3
- [ ] PROCEED button disabled if user has active loan
- [ ] "Your Applicable Rate" box shows correct final rate

---

## 💡 QUICK REFERENCE

**Nano Loan Interest Model:**
- Base: PIR (Portfolio Interest Rate)
- Optional: SIR (Subsidy)
- Formula: `PIR - SIR = Final Rate`

**Term Loan Interest Model:**
- Base: IIR (Individual Interest Rate)
- Tiered by rating: Fair (0-3), Good (4-6), Excellent (7-10)
- Formula: `IIR[user_tier] = Final Rate`

**Account Level Format:**
- "NL5 / TL0" means Nano Level 5, Term Level 0
- Extract from loan_id: "NL5..." = Nano Level 5, "TL2..." = Term Level 2

**Loan Access Control:**
- Society can disable nano or term loans via `loan_access` config
- Buttons must check BOTH `isApproved` AND `loan_enabled` flags
- Active loans block new applications (check both nano_loans and term_loans tables)

---

## 🆘 SUPPORT

If you encounter issues or need clarification:
1. Check the updated API documentation: `/MOBILE_APP_API_DOCUMENTATION.md`
2. Test API endpoints directly using Postman/cURL
3. Check browser console for `[v0]` debug logs
4. Verify authentication token is being sent correctly

**Common Issues:**
- 401 Unauthorized: Auth token not being sent or expired
- 403 Forbidden: Loan type disabled for user's society
- 409 Conflict: User has active loan

---

**End of Updates**
