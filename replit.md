# ReferredBy Mobile App

## Overview

This is a mobile lending application built as a frontend shell that connects to an existing backend at `https://appv2.referredby.com.na`. The project has two main components:

1. **Web Preview (Vite/React)** - Located in `client/` - A web-based preview of the mobile app UI
2. **Native Mobile App (Expo/React Native)** - Located in `mobile/` - The production Android/iOS app

The application handles user authentication, profile display, and loan interest confirmation for a lending service called "Simplicity Lending" / "ReferredBy".

**Critical Note**: This is a frontend-only build. All backend logic, database, and APIs already exist. Do NOT create new database tables, modify schemas, or create new API endpoints.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Web Client (`client/`)**
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming

**Mobile App (`mobile/`)**
- **Framework**: Expo (React Native)
- **Navigation**: React Navigation (native-stack)
- **Build System**: EAS Build for generating APKs
- **Storage**: AsyncStorage for session persistence

### Backend Integration

The app connects to an existing backend API:
- **Base URL**: `https://appv2.referredby.com.na`
- **Authentication**: Supabase Auth with Bearer token
- **Key Endpoints**:
  - `POST /api/auth/login` - User authentication
  - `GET /api/users/me` - Fetch user profile
  - `POST /api/mobile/interest-confirmation` - Get loan interest details

### Authentication Flow

1. User enters email and 6-digit PIN
2. App authenticates directly with Supabase using `signInWithPassword`
3. Access token is stored and used for subsequent API calls
4. Backend API endpoints require `Authorization: Bearer <token>` header

### Environment Variables

**Web (Vite)** - Uses `VITE_` prefix:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

**Mobile (Expo)** - Uses `EXPO_PUBLIC_` prefix:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_BASE_URL`

### Database

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Migrations**: `./migrations/` directory
- **Note**: The local schema is minimal (just users table). The actual production database is managed by the external backend.

### Build & Development

- `npm run dev` - Start development server (Express + Vite)
- `npm run build` - Production build (uses custom `script/build.ts`)
- `npm run db:push` - Push schema changes to database
- Mobile builds use EAS CLI (`eas build --platform android --profile preview`)

## External Dependencies

### Authentication & Backend
- **Supabase** (`@supabase/supabase-js`) - Authentication and real-time database client
- **Backend API** - External REST API at `https://appv2.referredby.com.na`

### Database
- **PostgreSQL** - Production database (managed externally)
- **Drizzle ORM** - Type-safe database queries and schema management
- **connect-pg-simple** - PostgreSQL session storage for Express

### UI Libraries
- **Radix UI** - Full suite of accessible UI primitives
- **shadcn/ui** - Pre-built component library (new-york style)
- **Lucide React** - Icon library
- **Framer Motion** - Animations (used in splash screen)
- **class-variance-authority** - Component variant management
- **tailwind-merge** - Tailwind class merging utility

### Mobile-Specific
- **Expo SDK 54** - React Native development platform
- **React Navigation 7** - Screen navigation
- **expo-secure-store** - Secure credential storage
- **react-native-url-polyfill** - URL API polyfill for React Native

### Development Tools
- **Vite** - Frontend build tool with HMR
- **esbuild** - Server bundling
- **TypeScript** - Type checking
- **Replit Plugins** - Dev banner, cartographer, runtime error overlay