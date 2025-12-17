# Project Context: AppMarketingSMEs (LAR - Local AI Responder)

## Overview
**LAR (Local AI Responder)** is a comprehensive marketing and reputation management solution designed for Vietnamese SMEs. It integrates with Google Business Profile and Zalo Official Account to help businesses manage reviews, engage customers, and run loyalty programs.

The project consists of two main components:
1. **`lar-app`**: The core web platform and backend API.
2. **`lar-mini-app`**: A Zalo Mini App for end-user interaction (loyalty, rewards).

---

## 1. Core Platform (`lar-app`)
This is the management dashboard for business owners and the backend server for the ecosystem.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, Radix UI, Shadcn/ui components
- **AI Integration**: OpenAI API, Google Generative AI (Gemini)
- **External APIs**: 
  - Google Business Profile API (`googleapis`)
  - Zalo Official Account API
  - Stripe (Payments)

### Key Features
- **Dashboard**: Business management, location settings, analytics.
- **Review Management**: Aggregates reviews from Google and Zalo.
- **AI Auto-Reply**: Generates responses to reviews using AI.
- **Loyalty System**: Manages rewards, points, and redemptions.
- **Integrations**: OAuth flows for connecting Google and Zalo accounts.

### Key Directories
- `src/app`: Next.js App Router pages and API routes.
- `src/lib`: Utility functions, API clients (Google, Zalo), and Prisma client.
- `prisma`: Database schema (`schema.prisma`) and migrations.

---

## 2. Mini App (`lar-mini-app`)
A client-facing application running inside the Zalo ecosystem, allowing customers to interact with businesses.

### Tech Stack
- **Platform**: Zalo Mini App (ZMP)
- **Framework**: React (Vite)
- **UI Library**: ZMP UI (`zmp-ui`)
- **State Management**: Recoil
- **Styling**: Tailwind CSS

### Key Features
- **Loyalty Program**: View points, redeem rewards.
- **Rewards**: Browse available gifts, view countdown timers for limited-time offers.
- **QR Code**: Generate codes for redemption.
- **Notifications**: Receive updates from the business.

---

## Development Workflow

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Zalo Mini App Developer Account
- Google Cloud Console Project (for GBP API)

### Setup
1. **`lar-app`**:
   ```bash
   cd lar-app
   npm install
   npx prisma generate
   npm run dev
   ```
2. **`lar-mini-app`**:
   ```bash
   cd lar-mini-app
   npm install
   npm start
   ```

## Recent Updates (as of Dec 2025)
- **Reward System Upgrade**: Added quantity tracking, start/end times, and active status to rewards.
- **Google OAuth**: Implemented robust retry logic with exponential backoff for API quota management.
- **Zalo Integration**: Refined OAuth callback and token management.
