# Simplicity Lending Mobile App - Backend Integration Documentation

**Version:** 2.1  
**Last Updated:** January 2026  
**Base URL:** `https://appv2.referredby.com.na`

---

## ⚠️ CRITICAL NOTICE FOR MOBILE DEVELOPERS

**DO NOT CREATE ANY NEW TABLES OR MODIFY THE DATABASE SCHEMA**

This mobile application is a shell/frontend for the existing web application backend. All database tables, API endpoints, authentication flows, and business logic already exist and are fully functional. Your responsibility is to:

1. **Connect to existing API endpoints** documented below
2. **Use the existing database schema** (read-only reference)
3. **Implement the mobile UI/UX** that mirrors the web app functionality
4. **Handle API responses** and display data appropriately

**You must NOT:**
- Create new database tables
- Modify existing tables or columns
- Create new API endpoints
- Change authentication flows
- Alter business logic or calculations
- Duplicate business logic in the mobile app (all calculations happen server-side)
- Use or reference the Supabase Service Role Key (mobile apps ONLY use the ANON key)

All backend infrastructure is production-ready. Focus solely on building the Expo mobile interface that consumes these existing services.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [User Flows](#user-flows)
6. [Business Logic & Calculations](#business-logic--calculations)
7. [SMS Integration](#sms-integration)
8. [File Upload](#file-upload)
9. [Error Handling](#error-handling)
10. [Environment Variables](#environment-variables)
11. [Cookie Handling for Expo Mobile Apps](#cookie-handling-for-expo-mobile-apps)
12. [Security Best Practices for Mobile](#security-best-practices-for-mobile)

---

## Overview

### Technology Stack

- **Backend:** Next.js 16 API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **File Storage:** Vercel Blob
- **SMS Provider:** SMSPortal (South African provider)
- **Timezone:** Africa/Windhoek (GMT+2)

### Key Features

- User registration with referral code validation
- OTP-based verification
- Nano loans (62-day due date, 2-month repayment period)
- Term loans (1-12-month term with monthly salary deductions)
- Credit scoring system (0-10 stars)
- Document management (ID, Payslip, Selfie)
- Active loan management
- Payment history tracking
- Interest rate calculation based on user rating (server-side only)

---

## Authentication & Authorization

### Authentication Flow

1. User signs up with referral code
2. System sends OTP via SMS
3. User verifies OTP
4. Account is created with Supabase Auth
5. Session cookies are set for subsequent requests

### Session Management

- Uses Supabase Auth cookies
- HTTP-only cookies for security
- No JWT tokens stored in mobile app
- Session expires automatically

### PIN Security

- PIN is 4-6 digits
- Stored as hashed password in Supabase Auth
- Used for login (`signInWithPassword`)

### Forgot Password Flow

Allows users to reset their PIN via OTP verification.

1. **Login Page** (`app/auth/login/page.tsx`)
   - User clicks "Forgot Password?"

2. **Forgot Password Page** (`app/auth/forgot-password/page.tsx`)
   
   **Step 1: Enter Mobile Number**
   - User enters registered mobile number
   - API: `POST /api/auth/send-otp`
   
   **Step 2: Verify OTP**
   - User enters OTP received via SMS
   - API: `POST /api/auth/verify-otp`
   
   **Step 3: Reset PIN**
   - User enters new 4-6 digit PIN
   - API: `POST /api/auth/reset-password`
   - Redirects to Login page

---

## Database Schema

### Core Tables

#### **users**
Main user profile table.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT UNIQUE NOT NULL,                    -- Format: RB1001, RB1002, etc.
  auth_user_id UUID REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT UNIQUE NOT NULL,              -- National ID number
  mobile TEXT UNIQUE NOT NULL,                 -- Format: +264XXXXXXXXX
  gender TEXT,                                 -- 'Male' or 'Female'
  region TEXT,
  town TEXT,
  street_name TEXT,
  physical_address TEXT,
  email TEXT UNIQUE NOT NULL,
  employer_name TEXT,
  occupation TEXT,
  office_number TEXT,
  employee_code TEXT,
  source_funds TEXT,                           -- Source of income/funds dropdown
  source_income TEXT,                          -- Additional income source
  nok_name TEXT,                               -- Next of kin
  nok_surname TEXT,
  nok_relationship TEXT,
  nok_mobile TEXT,
  po_box TEXT,
  lending_society_id UUID REFERENCES lending_societies(id),
  referring_party TEXT,                        -- Staff code
  referring_partner UUID REFERENCES partner_staff(id),
  membership_status TEXT DEFAULT 'AA',         -- See MEMBER STATUS CODES below
  nano_loan_limit NUMERIC(10,2),               -- Max nano loan amount
  term_loan_limit NUMERIC(10,2),               -- Max term loan amount
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**MEMBER STATUS CODES:**
- **AA:** Awaiting LS Approval (green)
- **AP:** Awaiting Community Approval (green)
- **AP2:** Approved by LS Partner (green)
- **DE:** Declined (red)
- **BL:** Blocked (red)
- **TA:** Total Applications (red - used for counting/reporting only)

#### **nano_loans**
Stores nano loan applications (62-day due date, 2-month repayment).

```sql
CREATE TABLE nano_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id TEXT UNIQUE NOT NULL,                -- Format: NL001, NL002, etc.
  user_id UUID REFERENCES users(id) NOT NULL,
  lending_society_id UUID REFERENCES lending_societies(id),
  loan_amount NUMERIC(10,2) NOT NULL,
  interest_rate NUMERIC(5,2),                  -- Percentage (e.g., 14.05)
  interest_amount NUMERIC(10,2),               -- Interest in NAD
  processing_fee_amount NUMERIC(10,2),         -- Fixed at 40.00 NAD
  total_repayable NUMERIC(10,2) NOT NULL,
  installment_amount NUMERIC(10,2),            -- Monthly installment (total/2)
  loan_period_months INTEGER DEFAULT 2,        -- Always 2 months
  
  -- Important dates
  due_date DATE NOT NULL,                      -- Created date + 62 days
  outstanding_date DATE NOT NULL,              -- Due date + 31 days (93 days total)
  block_date DATE NOT NULL,                    -- Outstanding date + 31 days (124 days total)
  
  status TEXT DEFAULT 'AA',                    -- See LOAN STATUS CODES below
  rate_basis TEXT,                             -- 'IIR' or 'SIR'
  effective_interest_percent NUMERIC(5,2),     -- Actual interest percentage applied
  borrower_rating_at_approval NUMERIC(3,1),    -- User rating when approved (0-10)
  outstanding_balance NUMERIC(10,2),           -- Remaining balance
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ
);
```

**LOAN STATUS CODES:**
- **PU:** Paid Up (green) - Loan fully repaid
- **DU:** Due (green) - Payment due soon
- **AD:** Awaiting Disbursements (blue) - Approved, awaiting funds transfer
- **AA:** Awaiting Approval (yellow) - Application submitted, pending review
- **OT:** Outstanding (orange) - Payment overdue
- **NR:** No Record (gray) - No loan found
- **BL:** Blocked (red) - Account blocked due to non-payment
- **DE:** Decline (red) - Application declined/rejected

**Nano Loan Date Calculations:**
- Due Date: Created date + 62 days
- Outstanding Date: Due date + 31 days (total: 93 days from creation)
- Block Date: Outstanding date + 31 days (total: 124 days from creation)

#### **term_loans**
Stores term loan applications (3-12-month term with monthly salary deductions).

```sql
CREATE TABLE term_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id TEXT UNIQUE NOT NULL,                -- Format: TL001, TL002, etc.
  user_id UUID REFERENCES users(id) NOT NULL,
  lending_society_id UUID REFERENCES lending_societies(id),
  loan_amount NUMERIC(10,2) NOT NULL,
  interest_rate NUMERIC(5,2),                  -- Percentage (e.g., 14.05)
  interest_amount NUMERIC(10,2),               -- Interest in NAD
  processing_fee_amount NUMERIC(10,2),         -- 40.00 NAD
  total_repayable NUMERIC(10,2) NOT NULL,
  installment_amount NUMERIC(10,2),            -- Monthly installment
  loan_period_months INTEGER DEFAULT 10,       -- 3-12 months
  
  -- Salary deduction dates
  first_deduction_date DATE,                   -- First month deduction
  final_deduction_date DATE,                   -- Last month deduction
  
  -- Important dates
  due_date DATE NOT NULL,                      -- SAME as final_deduction_date
  outstanding_date DATE NOT NULL,              -- Due date + 31 days
  block_date DATE NOT NULL,                    -- Outstanding date + 31 days (62 days after due)
  
  status TEXT DEFAULT 'AA',                    -- See LOAN STATUS CODES above
  rate_basis TEXT,                             -- 'IIR' or 'SIR'
  effective_interest_percent NUMERIC(5,2),
  borrower_rating_at_approval NUMERIC(3,1),
  outstanding_balance NUMERIC(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ
);
```

**Term Loan Date Calculations:**
- Due Date: EQUAL to Final Deduction Date (same date)
- Outstanding Date: Due date + 31 days
- Block Date: Outstanding date + 31 days (62 days after due date)

#### **otp_signatures**
Stores OTP verification records for digital signatures on loan contracts.

```sql
CREATE TABLE otp_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id TEXT NOT NULL,                       -- References nano_loans.loan_id or term_loans.loan_id
  loan_type TEXT NOT NULL,                     -- 'nano' or 'term'
  user_id UUID REFERENCES users(id) NOT NULL,
  portfolio_holder_id UUID,
  referring_partner_id UUID REFERENCES partner_staff(id),
  otp TEXT NOT NULL,                           -- Actual OTP code (masked in display as *****)
  mobile TEXT NOT NULL,                        -- User's mobile number
  timestamp_windhoek TEXT NOT NULL,            -- Formatted timestamp in Windhoek GMT+2
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **user_ratings**
Credit scoring system (0-10 stars).

```sql
CREATE TABLE user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  score INTEGER DEFAULT 0,                     -- 0-10 scale
  rating_category TEXT,                        -- 'Fair', 'Good', 'Excellent'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Rating Categories:**
- 0-3 Stars: Fair
- 4-6 Stars: Good  
- 7-10 Stars: Excellent

#### **user_documents**
Tracks uploaded documents per user.

```sql
CREATE TABLE user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  national_id_url TEXT,                        -- Vercel Blob URL
  payslip_url TEXT,                            -- Vercel Blob URL
  selfie_url TEXT,                             -- Vercel Blob URL
  declaration_url TEXT,                        -- Vercel Blob URL
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **referral_codes**
Validates referral codes during signup.

```sql
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  lending_society_id UUID REFERENCES lending_societies(id),
  partner_id UUID,
  staff_code TEXT,
  referral_owner_id UUID,
  status TEXT DEFAULT 'active',                -- active, used, expired
  used_at TIMESTAMPTZ,
  used_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **lending_societies**
Organizations/companies that partner with ReferredBy.

```sql
CREATE TABLE lending_societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **portfolio_partners**
Lenders providing the capital (e.g., Destiny Group Pty LTD).

```sql
CREATE TABLE portfolio_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_uid TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **partner_staff**
Referring partners/agents (agents who bring borrowers).

```sql
CREATE TABLE partner_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  staff_name TEXT,                             -- Full concatenated name
  staff_code TEXT UNIQUE,                      -- Unique staff identifier
  email TEXT,
  mobile TEXT,
  lending_society_id UUID REFERENCES lending_societies(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Agent Name Lookup:**
To get the referring agent's name for digital signatures:
1. Get `users.referring_partner` (UUID)
2. Join with `partner_staff` table on `id`
3. Concatenate `first_name + ' ' + last_name`

#### **activity_history**
Stores loan activities such as disbursements, payments, and status changes.

```sql
CREATE TABLE activity_history (
  id UUID PRIMARY KEY,
  entity_id UUID NOT NULL,              -- References nano_loans.id or term_loans.id
  entity_type TEXT NOT NULL,            -- 'nano_loan' or 'term_loan'
  activity_type TEXT NOT NULL,          -- 'disbursement', 'payment', 'status_change', 'status_update'
  new_value TEXT,                       -- New balance or status code
  note TEXT,                            -- Payment details, e.g., "Payment received: NAD 2000.00"
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Activity Types:**
- `disbursement`: Loan was disbursed, show total_repayable as starting balance
- `payment`: Payment received, extract amount from note field
- `status_change`/`status_update`: Status changed (AA → DU → OT → PU), show status label

**Status Display:**
When activity_type is 'status_change' or 'status_update', parse the status code from note or new_value and display the status label (see LOAN STATUS CODES above).

---

## API Endpoints

### 1. Referral Validation

**POST** `/api/referrals/validate`

Validates a referral code and returns lending society and partner information.

**Request:**
```json
{
  "code": "REFER123"
}
```

**Response (200):**
```json
{
  "valid": true,
  "lending_society_id": "uuid",
  "lending_society_name": "Kayla Industries",
  "partner_id": "uuid",
  "staff_code": "STAFF001",
  "referral_owner_id": "uuid"
}
```

**Response (400):**
```json
{
  "valid": false,
  "error": "Invalid or expired referral code"
}
```

---

### 2. Check Uniqueness

**POST** `/api/auth/check-uniqueness`

Checks if ID number, mobile, or email already exists.

**Request:**
```json
{
  "id_number": "12345678901",
  "mobile": "+264812345678",
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "id_number_exists": false,
  "mobile_exists": false,
  "email_exists": false
}
```

---

### 3. Send OTP

**POST** `/api/auth/send-otp`

Sends OTP via SMS to the user's mobile number.

**Request:**
```json
{
  "mobile": "+264812345678",
  "type": "registration"  // or "login" or "loan" or "password_reset"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Response (400):**
```json
{
  "error": "Mobile number is required"
}
```

**Response (500):**
```json
{
  "error": "Failed to send OTP"
}
```

**Notes:**
- OTP is 6 digits
- Expires in 10 minutes
- Stored in `otp_verifications` table
- SMS sent via SMSPortal API

---

### 4. Verify OTP

**POST** `/api/auth/verify-otp`

Verifies the OTP code entered by the user.

**Request:**
```json
{
  "mobile": "+264812345678",
  "otp": "123456",
  "type": "registration"  // or "login" or "loan" or "password_reset"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Response (400):**
```json
{
  "error": "Invalid OTP"
}
```

---

### 5. User Signup

**POST** `/api/auth/signup`

Creates a new user account after OTP verification.

**Request:**
```json
{
  "referral": {
    "code": "REFER123",
    "lending_society_id": "uuid",
    "staff_code": "STAFF001",
    "partner_id": "uuid",
    "referral_owner_id": "uuid"
  },
  "personal": {
    "full_names": "John",
    "surname": "Doe",
    "id_number": "12345678901",
    "mobile": "+264812345678",
    "gender": "Male",
    "region": "Erongo",
    "town": "Walvis Bay",
    "street_name": "Main Street",
    "physical_address": "123 Main St",
    "email": "john@example.com"
  },
  "employer": {
    "employer_name": "ABC Company",
    "occupation": "Engineer",
    "office_number": "+264611234567",
    "employee_code": "EMP001",
    "nok_name": "Jane",
    "nok_surname": "Doe",
    "nok_relationship": "Spouse",
    "nok_mobile": "+264812345679",
    "po_box": "PO Box 123",
    "source_funds": "Employment Salary",
    "source_income": "Employment Salary"
  },
  "pin": "1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "user_id": "uuid",
  "auth_user_id": "uuid"
}
```

**Response (422):**
```json
{
  "error": "This email is already registered. Please use a different email or try logging in."
}
```

**Response (500):**
```json
{
  "error": "Failed to create user profile",
  "details": "..."
}
```

**Notes:**
- Generates unique UID (RB1001, RB1002, etc.)
- Creates Supabase Auth user
- Creates user profile in `users` table
- Marks referral code as used
- Initializes `user_documents` record

---

### 6. User Login

**POST** `/api/auth/login`

Logs in user with email and PIN.

**Request:**
```json
{
  "email": "john@example.com",
  "pin": "1234"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Response (401):**
```json
{
  "error": "Invalid email or PIN"
}
```

**Notes:**
- Sets session cookies
- Uses Supabase `signInWithPassword`

---

### 7. Upload Selfie

**POST** `/api/upload/selfie`

Uploads user selfie to Vercel Blob.

**Request:** `multipart/form-data`
- `file`: Image file (JPG, PNG)
- `userId`: User UUID

**Response (200):**
```json
{
  "url": "https://blob.vercel-storage.com/selfies/uuid-timestamp.jpg"
}
```

**Response (400):**
```json
{
  "error": "Invalid file type. Only JPG and PNG are allowed"
}
```

**Validation:**
- Max file size: 5MB
- Allowed types: JPG, PNG
- File naming: `selfies/{userId}-{timestamp}.ext`

---

### 8. Upload Documents

**POST** `/api/upload/documents`

Uploads national ID and payslip documents.

**Request:** `multipart/form-data`
- `userId`: User UUID
- `national_id`: Image/PDF file
- `payslip`: Image/PDF file

**Response (200):**
```json
{
  "national_id_url": "https://blob.vercel-storage.com/documents/...",
  "payslip_url": "https://blob.vercel-storage.com/documents/..."
}
```

**Response (400):**
```json
{
  "error": "National ID: File size must be less than 5MB"
}
```

**Validation:**
- Max file size: 5MB per file
- Allowed types: JPG, PNG, PDF
- Both files required

---

### 9. Get User Profile

**GET** `/api/users/me`

Retrieves authenticated user's complete profile data including documents, credit rating, loan access, and account level.

**Authentication:** Required (session cookie or Bearer token)

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "uid": "RB1015",
    "account_name": "DOBSON ANDRE",
    "client_id": "8503029996",
    "membership_status": "AP2",
    "borrower_rating": 1.0,
    "credit_score": 10,
    "lifetime_points": 50,
    "lifetime_penalties": 0,
    "nano_loan_limit": 2000.00,
    "term_loan_limit": 500.00,
    "nano_installment": "MAX | NAD 2000.00",
    "term_installment": "MAX | NAD 500.00",
    "account_level": "NL5 / TL0",
    "lending_society_name": "Kayla Industries",
    "referring_partner_name": "nastya peno",
    "documents": {
      "national_id": true,
      "payslip": true,
      "kyc": true
    },
    "document_deadline": "2026-06-11T00:00:00.000Z",
    "is_doc_update_needed": false,
    "loan_access": {
      "nano": true,
      "term": true,
      "term_max_months": 12,
      "term_min_months": 1
    },
    "nano_loan_enabled": true,
    "term_loan_enabled": true
  }
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

**Notes:**
- `borrower_rating`: Credit rating (0-10 scale) calculated from rating_events
- `account_level`: Format "NL{nano_level} / TL{term_level}" extracted from latest loan_id
- `documents`: Boolean flags for ID, Payslip, and KYC document status (green if true, grey if false)
- `document_deadline`: ISO timestamp for when documents need updating (6 months from approved_at)
- `is_doc_update_needed`: True if membership_status is "DE" or "DE2" OR document_deadline has passed
- `loan_access`: Society's configuration for which loan types are enabled
- `nano_loan_enabled`: Whether REQUEST NANO LOAN button should be enabled
- `term_loan_enabled`: Whether APPLY FOR TERM LOAN button should be enabled

---

### 10. Interest Confirmation

**GET** `/api/mobile/interest-confirmation?type={nano|term}`

Calculates and displays interest rates for nano or term loans based on society configuration and user rating.

**Authentication:** Required (session cookie or Bearer token)

**Query Parameters:**
- `type` (required): "nano" or "term"

**Response (200) - NANO LOAN:**
```json
{
  "referring_partner": "nastya peno",
  "lender": "Destiny Group Pty LTD",
  "lending_society": "Kayla Industries",
  "borrower": "DOBSON ANDRE",
  "active_interest_mode": "PIR + SIR",
  "pir_percent": 28.00,
  "sir_enabled": true,
  "sir_percent": 3.15,
  "sir_policy": "after_pir",
  "iir_enabled": false,
  "fees": {
    "processing": 32,
    "late_fee": 5
  },
  "progression_levels": {
    "nano": {
      "L1": 2000,
      "L2": 4200,
      "L3": 8700
    },
    "term": {
      "L1": 13000,
      "L2": 15000,
      "L3": 20000
    }
  },
  "user_star_rating": 0,
  "user_tier_label": "Fair (0-3)",
  "rate_basis": "PIR+SIR",
  "user_effective_rate": 24.75,
  "can_proceed": true,
  "has_active_loan": false
}
```

**Response (200) - TERM LOAN:**
```json
{
  "referring_partner": "nastya peno",
  "lender": "Destiny Group Pty LTD",
  "lending_society": "Kayla Industries",
  "borrower": "DOBSON ANDRE",
  "active_interest_mode": "IIR (Rating-Based)",
  "iir_enabled": true,
  "iir_base": 24.75,
  "iir_rates": {
    "fair": 27.90,
    "good": 18.60,
    "excellent": 12.45
  },
  "pir_percent": 0,
  "sir_enabled": false,
  "fees": {
    "processing": 64,
    "late_fee": 5
  },
  "progression_levels": {
    "nano": {
      "L1": 2000,
      "L2": 4200,
      "L3": 8700
    },
    "term": {
      "L1": 13000,
      "L2": 15000,
      "L3": 20000
    }
  },
  "user_star_rating": 0,
  "user_tier_label": "Fair (0-3)",
  "rate_basis": "IIR",
  "user_effective_rate": 24.75,
  "can_proceed": true,
  "has_active_loan": false
}
```

**Response (403):**
```json
{
  "error": "Nano loans are currently not available for your lending society.",
  "loan_access_disabled": true
}
```

**Response (409):**
```json
{
  "error": "You have an active loan. Please settle it before applying for a new one.",
  "has_active_loan": true
}
```

**CRITICAL NOTES:**

**NANO LOANS (type=nano):**
- Use **PIR (Portfolio Interest Rate)** only
- Optionally apply **SIR (Subsidized Interest Rate)** if enabled
- Formula: `finalRate = PIR - SIR` (if SIR enabled and policy is "after_pir")
- DO NOT show IIR section
- DO NOT show individual rating tiers
- Display "Portfolio Interest Rate (PIR)" section with base rate
- Display "Subsidized Interest Rate (SIR)" section if enabled

**TERM LOANS (type=term):**
- Use **IIR (Individual Interest Rate)** based on rating tiers
- Formula: `finalRate = iir_rates[userTier]` (no PIR or SIR)
- Display "Term Loan Base Rate" with `iir_base` value
- Display "Individual Interest Rate (IIR)" section with three tiers:
  - 0-3 Stars (Fair): 27.90%
  - 4-6 Stars (Good): 18.60%
  - 7-10 Stars (Excellent): 12.45%
- DO NOT show PIR section
- DO NOT show SIR section
- User's rate is determined solely by their star rating tier

**Button Control:**
- `can_proceed`: Enable PROCEED button only if both `loan_access` allows it AND `!has_active_loan`
- `has_active_loan`: Checks across BOTH nano_loans and term_loans for statuses: AA, AD, DU, OT, BL
- If user has ANY active loan (nano OR term), PROCEED button is disabled

---

### 11. Get Credit Score History

**GET** `/api/mobile/credit-score-history?user_id=[user_id]`

Retrieves the user's credit score history and rating details.

**Query Parameters:**
- `user_id` (required): User UUID

**Response (200):**
```json
{
  "success": true,
  "rating": {
    "score": 7,
    "rating_category": "Excellent",
    "updated_at": "2026-01-05T10:30:00Z"
  },
  "history": [
    {
      "score": 7,
      "rating_category": "Excellent",
      "updated_at": "2026-01-05T10:30:00Z",
      "reason": "Consistent payment history"
    },
    {
      "score": 5,
      "rating_category": "Good",
      "updated_at": "2025-12-01T08:15:00Z",
      "reason": "Initial rating"
    }
  ]
}
```

**Response (404):**
```json
{
  "error": "User rating not found"
}
```

**Notes:**
- Score range: 0-10
- Categories: 0-3 (Fair), 4-6 (Good), 7-10 (Excellent)
- History shows rating changes over time
- Mobile displays as star rating (e.g., 7 stars out of 10)

---

### 12. Update User Profile

**PUT** `/api/mobile/profile`

Updates user profile information (address, phone, employer details, next of kin).

**Request:**
```json
{
  "user_id": "uuid",
  "updates": {
    "mobile": "+264812345678",
    "region": "Khomas",
    "town": "Windhoek",
    "street_name": "Independence Avenue",
    "physical_address": "456 New Street",
    "employer_name": "XYZ Corporation",
    "occupation": "Manager",
    "office_number": "+264611234567",
    "employee_code": "EMP002",
    "nok_name": "Jane",
    "nok_surname": "Smith",
    "nok_relationship": "Sister",
    "nok_mobile": "+264812345680",
    "po_box": "PO Box 456",
    "source_funds": "Employment Salary",
    "source_income": "Employment Salary"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Response (400):**
```json
{
  "error": "Mobile number already exists"
}
```

**Response (403):**
```json
{
  "error": "Cannot update profile: User not authenticated"
}
```

**Validation:**
- Mobile must be unique if changed
- All fields are optional (only send changed fields)
- Cannot change: id_number, email, uid, membership_status
- Source of funds options: Employment Salary, Business Income, Pension, Investment Income, Other

**Notes:**
- Uses Supabase RLS for security (user can only update their own profile)
- Mobile change requires OTP verification before update is applied

---

### 13. Create Loan Request

**POST** `/api/mobile/loan-request`

Creates a new loan application (nano or term).

**Request (Nano Loan):**
```json
{
  "user_id": "uuid",
  "loan_type": "nano",
  "loan_amount": 5000,
  "loan_interest": 387,
  "loan_interest_percentage": 7.74,
  "processing_fee": 40,
  "total_repayable": 5427,
  "monthly_installment": 2713.50,
  "otp_code": "123456"
}
```

**Request (Term Loan):**
```json
{
  "user_id": "uuid",
  "loan_type": "term",
  "loan_amount": 50000,
  "loan_period": 10,
  "first_deduction_date": "2026-03-05",
  "bank_name": "Bank Windhoek",
  "account_number": "12345678",
  "bank_branch": "Main Branch",
  "otp_code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "loan_id": "uuid",
  "message": "Loan application submitted successfully"
}
```

**Response (400):**
```json
{
  "error": "Invalid OTP"
}
```

**Notes:**
- Validates OTP before creating loan
- Creates `otp_signatures` record
- Calculates due_date, outstanding_date, block_date
- For term loans: Due date = Final deduction date
- Stores referring partner name from `partner_staff` table

---

### 14. Get Loan Request Data

**GET** `/api/mobile/loan-request?user_id={uuid}`

Retrieves user data needed for loan application forms.

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "uid": "RB1001",
    "first_name": "John",
    "last_name": "Doe",
    "mobile": "+264812345678",
    "email": "john@example.com",
    "lending_society": "Kayla Industries",
    "referring_party": "STAFF001",
    "referring_partner_name": "Jane Smith"
  },
  "rating": {
    "score": 7,
    "rating_category": "Excellent"
  },
  "portfolio_holder": {
    "id": "uuid",
    "full_name": "Destiny Group Pty LTD"
  },
  "referring_partner": {
    "id": "uuid",
    "name": "Jane Smith"
  }
}
```

---

### 15. Get Active Loan Statement

**GET** `/api/mobile/loan-request?user_id={uuid}&status=active`

Retrieves active loan details.

**Response (200):**
```json
{
  "success": true,
  "loan": {
    "id": "uuid",
    "loan_type": "nano",
    "loan_amount": 5000,
    "total_repayable": 5427,
    "monthly_installment": 2713.50,
    "status": "active",
    "due_date": "2026-03-05",
    "outstanding_date": "2026-04-05",
    "block_date": "2026-05-06",
    "created_at": "2026-01-01T10:00:00Z"
  }
}
```

---

### 16. Get Loan History

**GET** `/api/mobile/loan-request?user_id={uuid}`

Retrieves all loan applications for a user.

**Response (200):**
```json
{
  "success": true,
  "loans": [
    {
      "id": "uuid",
      "loan_type": "nano",
      "loan_amount": 5000,
      "total_repayable": 5427,
      "status": "completed",
      "created_at": "2025-11-01T10:00:00Z",
      "due_date": "2026-01-03",
      "outstanding_date": "2026-02-03",
      "block_date": "2026-03-06"
    }
  ]
}
```

---

### 17. Send OTP (Password Reset)

**POST** `/api/auth/send-otp`

Sends OTP for password reset.

**Request:**
```json
{
  "mobile": "+264812345678",
  "type": "password_reset"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Response (404):**
```json
{
  "error": "Mobile number not registered"
}
```

**Notes:**
- Validates that mobile number exists in users table
- OTP expires in 10 minutes
- Same OTP system as registration/login

---

### 18. Verify OTP (Password Reset)

**POST** `/api/auth/verify-otp`

Verifies OTP for password reset.

**Request:**
```json
{
  "mobile": "+264812345678",
  "otp": "123456",
  "type": "password_reset"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Response (400):**
```json
{
  "error": "Invalid or expired OTP"
}
```

---

### 19. Reset Password

**POST** `/api/auth/reset-password`

Resets user's PIN after OTP verification.

**Request:**
```json
{
  "mobile": "+264812345678",
  "newPin": "5678"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Response (400):**
```json
{
  "error": "PIN must be 4-6 digits"
}
```

**Response (404):**
```json
{
  "error": "User not found"
}
```

**Response (500):**
```json
{
  "error": "Failed to update PIN"
}
```

**Security Notes:**
- OTP must be verified BEFORE calling this endpoint
- Mobile app should enforce this flow: send OTP → verify OTP → reset password
- PIN is validated server-side (4-6 digits)
- Updates Supabase Auth password using admin API

---

## User Flows

### Registration Flow

1. **Landing Page** (`app/page.tsx`)
   - User clicks "Sign Up"

2. **Referral Code** (`app/auth/signup/page.tsx`)
   - User enters referral code
   - API: `POST /api/referrals/validate`
   - Displays lending society name

3. **Personal Information** (`app/auth/personal-info/page.tsx`)
   - User enters: Full names, Surname, ID number, Mobile, Gender, Region, Town, Street, Address, Email
   - API: `POST /api/auth/check-uniqueness` (validates ID, mobile, email)

4. **Employer Information** (`app/auth/employer-info/page.tsx`)
   - User enters: Employer name, Occupation, Office number, Employee code, NOK details, PO Box, Source of Income/Funds

5. **Community (PIN Setup)** (`app/auth/community/page.tsx`)
   - User creates 4-6 digit PIN
   - Confirms PIN

6. **OTP Verification** (`app/auth/verify-otp/page.tsx`)
   - API: `POST /api/auth/send-otp` (sends SMS)
   - User enters OTP
   - API: `POST /api/auth/verify-otp`
   - API: `POST /api/auth/signup` (creates account)

7. **Upload Selfie** (`app/auth/upload-selfie/page.tsx`)
   - User captures/uploads selfie
   - API: `POST /api/upload/selfie`

8. **Upload Documents** (`app/auth/upload-documents/page.tsx`)
   - User uploads National ID and Payslip
   - API: `POST /api/upload/documents`
   - Updates `user_documents` table

9. **Signup Success** (`app/auth/signup-success/page.tsx`)
   - Displays success message
   - Redirects to Home

---

### Login Flow

1. **Login Page** (`app/auth/login/page.tsx`)
   - User enters email and PIN
   - API: `POST /api/auth/login`
   - Redirects to Home

---

### Nano Loan Application Flow

1. **Home Page** (`app/home/page.tsx`)
   - User clicks "Apply for Nano Loan"

2. **Loan Application** (`app/loans/apply/page.tsx?type=nano`)
   - User enters loan amount (NAD 300 - NAD 8,000)
   - **Real-time calculation box displayed** (always visible, not triggered):
     - Shows: Loan Amount, Loan Interest, Processing Fee, Total Repayable, Monthly Installment
   - User clicks "Proceed to Interest Confirmation"

3. **Interest Confirmation** (`app/loans/interest-confirmation/page.tsx?type=nano`)
   - API: `POST /api/mobile/interest-confirmation`
   - Displays:
     - Referring Partner (agent name from partner_staff)
     - Lender (portfolio holder from portfolio_partners)
     - Lending Society
     - Borrower name
     - Interest Mode: IIR (Rating-Based)
     - Portfolio Interest Rate (PIR): 28.00%
     - User Rating: X stars (Category)
     - Individual Interest Rate (IIR): X.XX%
     - Subsidized Interest Rate (SIR): X.XX%
   - User clicks "Accept"

4. **Back to Loan Application - OTP Modal**
   - Modal appears: "Confirm Loan Application"
   - Shows loan details
   - API: `POST /api/auth/send-otp` (type: "loan")
   - User enters OTP
   - API: `POST /api/mobile/loan-request` (creates loan)
   - Redirects to `/home`

---

### Term Loan Application Flow

1. **Home Page** (`app/home/page.tsx`)
   - User clicks "Apply for Term Loan"

2. **Term Loan Landing** (`app/loans/term-loan/page.tsx`)
   - User enters loan amount (NAD 10,000 - NAD 150,000)
   - User enters loan period (1-10 months)
   - User selects first deduction date
   - Displays calculated monthly installment
   - User clicks "Proceed to NDI Check"

3. **Net Disposable Income** (`app/loans/term-loan/net-disposable-income/page.tsx`)
   - User enters gross salary and deductions
   - Calculates NDI and affordability
   - User clicks "Proceed to Bank Details"

4. **Bank Details** (`app/loans/term-loan/bank-details/page.tsx`)
   - User enters: Bank name, Account number, Branch code
   - User clicks "Proceed to Authorization"

5. **Bank Authorization** (`app/loans/term-loan/bank-authorization/page.tsx`)
   - User agrees to debit order authorization
   - User ticks checkbox: "I authorize salary deductions"
   - User clicks "Submit Application"

6. **OTP Modal** (same as nano loan)
   - API: `POST /api/auth/send-otp`
   - User enters OTP
   - API: `POST /api/mobile/loan-request` (creates term loan)
   - Redirects to `/home`

---

### Active Loan Management

1. **Home Page** (`app/home/page.tsx`)
   - User clicks "Active Loans"

2. **Active Statement** (`app/loans/active-statement/page.tsx`)
   - API: `GET /api/mobile/loan-request?user_id={uuid}&status=active`
   - Displays:
     - Loan amount
     - Total repayable
     - Monthly installment
     - Due date
     - Outstanding date
     - Block date
     - Days remaining
     - Payment progress

---

### Loan History

1. **Home Page** (`app/home/page.tsx`)
   - User clicks "Loan History"

2. **History Page** (`app/loans/history/page.tsx`)
   - API: `GET /api/mobile/loan-request?user_id={uuid}`
   - Displays list of all loans
   - User clicks on a loan to view contract

3. **Contract Modal**
   - Displays digital loan contract with:
     - Loan details
     - NANO LOAN DETAILS or TERM LOAN DETAILS section with dates
     - Bank details (term loans)
     - Digital Signature section:
       - OTP Used (Signature): ******
       - Mobile Number: +264XXXXXXXXX
       - Date & Time (Windhoek GMT+2): 06/01/2026, 11:19:41
       - Borrower's Name: JOHN DOE
       - Agent Name: Jane Smith (from partner_staff)

---

### Payment Record

1. **Home Page** (`app/home/page.tsx`)
   - User clicks "Payment Record"

2. **Payment Record Page** (`app/loans/payment-record/page.tsx`)
   - Displays complete payment history from `activity_history` table
   - Shows all loan activities: disbursements, payments, status changes
   - Groups records by loan_id with visual separators
   - Displays: Date, Loan ID, Activity Type, Amount Received, Balance
   - Buttons: VIEW STATEMENT, Payment methods (coming soon)

**Data Source:** `activity_history` table

**API Query (example):**
```typescript
// Get all nano and term loan UUIDs for user
const nanoLoans = await supabase
  .from('nano_loans')
  .select('id, loan_id, total_repayable, status')
  .eq('user_id', userId);

const termLoans = await supabase
  .from('term_loans')
  .select('id, loan_id, total_repayable, status')
  .eq('user_id', userId);

// Get all activities for these loans
const allLoanUuids = [...nanoLoans.map(l => l.id), ...termLoans.map(l => l.id)];

const activities = await supabase
  .from('activity_history')
  .select('*')
  .in('entity_id', allLoanUuids)
  .order('created_at', { ascending: false });
```

**Display Logic:**

Mobile receives activity records and must:
1. **Map entity_id to loan_id**: Create a lookup map from UUID → loan_id
2. **Sort by loan_id first**, then by date within each loan
3. **Group visually**: Add thick border between different loan_id groups
4. **Format amounts**:
   - Extract amount from note field: `"Payment received: NAD 2000.00"` → `"N$2000.00"`
   - For disbursements: Show `total_repayable` as balance
   - For status changes: Show status label instead of amount
5. **Date format**: DD/MM/YY (e.g., 06/01/26)

**Activity Types:**
- `disbursement`: Loan was disbursed, show total_repayable as starting balance
- `payment`: Payment received, extract amount from note field
- `status_change`/`status_update`: Status changed (AA → DU → OT → PU), show status label

**Status Display:**
When activity_type is 'status_change' or 'status_update', parse the status code from note or new_value and display the status label (see LOAN STATUS CODES above).

---

## Business Logic & Calculations

**⚠️ CRITICAL: Mobile app does NOT implement these calculations.**

This section documents what the backend does for your understanding only. Mobile apps MUST display values returned by API responses without modification or recalculation. All business logic happens server-side.

### Credit Rating System

**Rating Scale:** 0-10 stars

**Categories:**
- 0-3 Stars: Fair (Red)
- 4-6 Stars: Good (Yellow)
- 7-10 Stars: Excellent (Green)

**Rating Impact on Interest:**
- Fair: 17.20% IIR
- Good: 11.99% IIR
- Excellent: 7.74% IIR

### Nano Loan Calculations

**Constraints:**
- Minimum: NAD 300
- Maximum: NAD 8,000
- Term: 62 days (2-month repayment)

**Interest Calculation:**
```
Portfolio Interest Rate (PIR) = 28.00%
Individual Interest Rate (IIR) = Based on user rating (7.74%, 11.99%, or 17.20%)
Subsidized Interest Rate (SIR) = PIR - IIR

Loan Interest (NAD) = (Loan Amount × IIR) / 100
Processing Fee = NAD 40 (fixed)
Total Repayable = Loan Amount + Loan Interest + Processing Fee
Monthly Installment = Total Repayable / 2
```

**Example (7-star rating):**
```
Loan Amount: NAD 5,000
IIR: 7.74%
Loan Interest: (5000 × 7.74) / 100 = NAD 387
Processing Fee: NAD 40
Total Repayable: 5000 + 387 + 40 = NAD 5,427
Monthly Installment: 5427 / 2 = NAD 2,713.50
```

**Date Calculations:**
```
Due Date = Created Date + 62 days
Outstanding Date = Due Date + 31 days
Block Date = Outstanding Date + 31 days
```

### Term Loan Calculations

**Constraints:**
- Minimum: NAD 10,000
- Maximum: NAD 150,000
- Period: 1-12 months

**Installment Calculation:**
```
Monthly Installment = Loan Amount / Loan Period
Final Deduction Date = First Deduction Date + (Loan Period - 1) months
Due Date = Final Deduction Date (same date)
Outstanding Date = Due Date + 31 days
Block Date = Outstanding Date + 31 days
```

**Example:**
```
Loan Amount: NAD 50,000
Loan Period: 10 months
First Deduction Date: 2026-03-05

Monthly Installment: 50000 / 10 = NAD 5,000
Final Deduction Date: 2026-12-05
Due Date: 2026-12-05
Outstanding Date: 2027-01-05
Block Date: 2027-02-05
```

### Net Disposable Income (NDI) Check

**Formula:**
```
Gross Salary: NAD X
Total Deductions: NAD Y
NDI = Gross Salary - Total Deductions

Affordability Check:
Monthly Installment ≤ NDI × 0.33 (33% of NDI)
```

**Example:**
```
Gross Salary: NAD 15,000
Total Deductions: NAD 3,000
NDI: NAD 12,000

Maximum Affordable Installment: 12000 × 0.33 = NAD 3,960
```

---

## SMS Integration

### Provider: SMSPortal (South Africa)

**API Endpoint:** `https://rest.smsportal.com/v1/bulkmessages`

**Authentication:**
- Client ID: `SMSPORTAL_CLIENT_ID`
- API Secret: `SMSPORTAL_API_SECRET`

**OTP SMS Format:**
```
Your ReferredBy OTP is: 123456
Valid for 10 minutes.
```

**Implementation:** `/api/sms/send`

**Request:**
```json
{
  "messages": [
    {
      "content": "Your ReferredBy OTP is: 123456\nValid for 10 minutes.",
      "destination": "+264812345678"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message_id": "..."
}
```

---

## File Upload

### ⚠️ CRITICAL: Vercel Blob Storage Architecture

**Mobile apps MUST NOT upload directly to Vercel Blob.**

**Correct Mobile Upload Flow:**

1. **Mobile App**
   - User selects file (camera/file picker)
   - Mobile sends file via `multipart/form-data` to server endpoint
   - **NO Blob token in mobile app**

2. **Next.js API Route (Server-Side)**
   - Endpoint receives file
   - Server uploads to Vercel Blob using `BLOB_READ_WRITE_TOKEN` (server-side only)
   - Returns public Blob URL
   - Updates `user_documents` table with URL

3. **Supabase Database**
   - Stores **only the URL** (not the file)
   - Mobile app reads URLs from database
   - RLS policies apply

**Why This Architecture:**
- Blob tokens must NEVER be exposed in mobile apps
- Server-side upload is secure and Play Store compliant
- Mobile app only consumes endpoints and displays URLs

### Vercel Blob Storage

**Configuration:**
- Token: `BLOB_READ_WRITE_TOKEN` (SERVER-SIDE ONLY, never in mobile)
- Access: Public URLs after upload
- Storage: Vercel Blob (NOT Supabase Storage)

**Upload Endpoints (Mobile uses these):**
- `POST /api/upload/selfie`
- `POST /api/upload/documents`

**Upload Paths (server-managed):**
- Selfies: `selfies/{userId}-{timestamp}.ext`
- Documents: `documents/{userId}-id-{timestamp}.ext`
- Payslips: `documents/{userId}-payslip-{timestamp}.ext`

**Constraints:**
- Max file size: 5MB
- Allowed types: JPG, PNG, PDF
- Returned URL format: `https://blob.vercel-storage.com/...`

**Mobile Implementation:**
```typescript
// Example: Mobile uploads selfie
const formData = new FormData();
formData.append('file', {
  uri: photoUri,
  type: 'image/jpeg',
  name: 'selfie.jpg',
});
formData.append('userId', userId);

const response = await fetch('https://appv2.referredby.com.na/api/upload/selfie', {
  method: 'POST',
  body: formData,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const { url } = await response.json();
// url is now stored in user_documents table
```

---

## Environment Variables

### Required Environment Variables

```bash
# Supabase (Mobile uses ONLY the anon key)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key


# Database (auto-generated by Supabase)
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Vercel Blob (SERVER-SIDE ONLY, never exposed to mobile)
BLOB_READ_WRITE_TOKEN=vercel_blob_token

# SMS Portal (SERVER-SIDE ONLY)
SMSPORTAL_API_SECRET=your-api-secret
SMSPORTAL_CLIENT_ID=your-client-id
```

**Mobile App Environment Variables:**

Mobile apps should ONLY use:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

All other keys (Service Role, Blob Token, SMS credentials) are server-side only and must NEVER be included in mobile builds.

---

## Cookie Handling for Expo Mobile Apps

Supabase authentication uses HTTP-only cookies for session management. Expo apps need special handling:

### Installation

```bash
npm install @react-native-cookies/cookies
```

### Implementation

```typescript
import CookieManager from '@react-native-cookies/cookies';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// After successful login, sync cookies
const syncCookies = async (session: any) => {
  await CookieManager.set('https://appv2.referredby.com.na', {
    name: 'sb-access-token',
    value: session.access_token,
    path: '/',
    secure: true,
    httpOnly: true,
  });
};
```

### Important Notes

- Always use HTTPS in production
- Test cookie persistence across app restarts
- Handle token refresh automatically with Supabase client

---

## Security Best Practices for Mobile

### User Profile Pattern

Use `/api/users/me` pattern instead of passing `user_id` in query strings:

```typescript
// ❌ AVOID: Exposes user_id in URL
GET /api/users/profile?user_id=123

// ✅ RECOMMENDED: Extract user from session
GET /api/users/me

// Server-side (Next.js API):
const session = await getSession(request);
const user_id = session.user.id;
```

This prevents users from accessing other users' data by manipulating query parameters.

---

## Contact & Support

For technical questions or integration support, contact your development team lead.

**Documentation Version:** 2.1  
**Last Updated:** January 2026
