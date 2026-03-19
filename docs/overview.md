# Overview

QPlanner is a campaign planning and asset management application for **Hakim Group** (optical practices). It allows:

- **Practices** (optical stores) to view and manage marketing campaigns assigned to them
- **Admins** to manage campaigns, assign them to practices, and coordinate asset delivery
- A **workflow system** for requesting, submitting, and approving campaign assets/creatives

## Production URL

- **App:** [planner.hakimgroup.co.uk](https://planner.hakimgroup.co.uk)
- **Auth:** Microsoft (Azure AD) login

## Tech Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Frontend         | React 18 + TypeScript + Vite                        |
| UI Library       | Mantine v7                                          |
| State Management | TanStack Query (React Query)                        |
| Backend          | Supabase (PostgreSQL + Auth + RPC functions)        |
| API Server       | Express.js (Node.js) — for emails and cron jobs     |
| Email            | Resend + React Email templates                      |
| Auth             | Supabase Auth with Azure AD OAuth (Microsoft login) |
| Hosting          | Vercel (client + server as separate projects)       |

## Project Structure

```
qplanner-hakimgroup/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # Supabase client, API helpers
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # React Query hooks for data fetching
│   │   ├── models/        # TypeScript types/interfaces
│   │   ├── pages/         # Route components
│   │   │   ├── admin/     # Admin panel pages
│   │   │   ├── auth/      # Login page
│   │   │   └── notificationsCenter/  # Notifications UI
│   │   └── shared/        # Shared utilities, enums, constants
│   └── .env               # Client environment variables
│
├── server/                 # Express API server
│   ├── api/
│   │   └── index.ts       # Main Express app with all endpoints
│   ├── emails/            # React Email templates
│   └── .env               # Server environment variables
│
└── docs/                  # This documentation site (VitePress)
```

## User Roles

| Role          | Description                                      |
| ------------- | ------------------------------------------------ |
| `user`        | Practice user — can view campaigns and submit assets |
| `admin`       | Admin — can manage campaigns, request assets, view all practices |
| `super_admin` | Super admin — full access including user management |

## Key Concepts

- **Practice** — An optical store/location in the Hakim Group network
- **Campaign** — A marketing campaign from the catalog (e.g., "Summer Sale 2026")
- **Bespoke Campaign** — A custom campaign created by a practice for their specific needs
- **Event** — A bespoke campaign with event-specific fields (event type, requirements)
- **Selection** — A practice's instance of a campaign, with dates, status, and chosen assets
- **Creative** — A campaign artwork/image option that practices choose from
- **Assets** — Printed and digital marketing materials (posters, social media, etc.)
