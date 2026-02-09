# FetchUs - Dog Walking App

Complete React PWA for professional dog walking service.

## Features

- **Client View**: See dogs, upcoming walks, and book services
- **Walker View**: Today's schedule with walk details and GPS tracking
- **Admin View**: Send broadcast messages and manage operations
- **Real Supabase Integration**: All data stored in PostgreSQL database

## Database

Connected to Supabase project with:
- 7 tables (users, dogs, walks, walk_locations, walk_reports, broadcast_messages, notifications)
- Row-level security policies
- Real-time capabilities
- Storage buckets for photos

## Deployment to Vercel

1. Push this code to GitHub
2. Connect repository to Vercel
3. Vercel will auto-deploy
4. Access at: fetchus.vercel.app

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Test Users

- **Client**: sarah@example.com (see dogs and walks)
- **Walker**: mike@fetchus.com (see today's schedule)
- **Admin**: admin@fetchus.com (send broadcasts)

## Technology Stack

- React 18
- Vite
- Supabase (PostgreSQL + Auth + Storage)
- Deployed on Vercel
