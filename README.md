# CitiFix

**CitiFix** is an AI-powered municipal issue reporting and management system built for the Okaikwei North Municipal Assembly in Ghana. It lets citizens report infrastructure problems — potholes, broken streetlights, blocked drains, waste, and electricity issues — and gives assembly staff a dashboard to triage, route, and resolve them.

This is a Final Year Project for the BSc. Computer Science programme at Ghana Communication Technology University.

## Overview

CitiFix has two surfaces:

- **Citizen PWA** — a mobile-first, installable Progressive Web App where residents submit reports with a description, photos, optional video, and GPS location.
- **Admin Dashboard**(TBC) — a web app for district assembly staff to review, categorize, prioritize, and resolve reports.

Submitted reports are processed by the **Google Gemini API**, which generates a summary, category tag, department routing suggestion, priority score, and moderation flag. All AI outputs are advisory — administrators can review and override them.

## Features

**Citizen-facing**
- Report submission with photos, video, and GPS/manual location pinning
- Duplicate detection within a 50m radius, with a soft prompt to support existing reports instead
- Support voting and comments on public reports
- Personal report tracking with status timeline and admin updates
- Shareable report links
- In-app notifications
- Guest reporting (no account required), tracked by device ID, linkable to an account later

**Admin-facing**(TBC)
- Full report status workflow (processing → active → in progress → resolved, etc.)
- AI output review and override, with audit logging
- Repair/status updates visible to citizens
- Comment moderation and user suspension logic
- Duplicate report merging
- Priority-5 alerts: persistent banner + forced acknowledgment modal

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS v4, Vite |
| Routing | React Router v7 |
| Icons | Lucide React |
| Maps | Leaflet.js / react-leaflet, Google Maps API |
| PWA | vite-plugin-pwa |
| Backend | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |
| AI | Google Gemini API |
| Hosting | Vercel |

## Project Structure

```
src/
├── screens/          # SplashScreen, HomeScreen, Step1Details, Step2Location,
│                     # Step3Review, SuccessScreen, MyReportsScreen,
│                     # ReportDetailScreen, ProfileScreen, NotificationsScreen,
│                     # LoginScreen, RegisterScreen
├── components/       # BottomNav, StatusBadge, ReportCard, StepIndicator, AppHeader
├── hooks/            # useReport, useGeolocation, useReverseGeocode,
│                     # useLocationSearch, useExifGps
├── context/          # ReportContext (multi-step form state)
└── ...
```

## Status

The citizen-facing PWA is fully built (12 screens, polish pass complete). Supabase backend integration is the current focus. Deferred items include the offline sync queue, live database-backed reference IDs, and dynamic notification badge counts.

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd citifix

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

> Note: full PWA installability (offline caching, add-to-home-screen) requires HTTPS and is best verified on a deployed Vercel build rather than the local dev server.

