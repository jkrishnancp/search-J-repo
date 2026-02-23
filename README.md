# JobApplyTracker

A full-stack web application for tracking job applications with an admin interface for managing keywords, sources, and documents.

## Tech Stack

- **Frontend**: Next.js 13 (App Router) + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)

## Features

- **Enhanced Dashboard**:
  - View application statistics by status (Saved, Applied, Interview, Offer, Rejected)
  - Weekly applications chart showing the last 8 weeks
  - Recent application updates table with 20 most recent changes
  - CSV export with filters by date range and status
- **Job Management**: Add, view, and track job applications with status updates
- **Application Tracking**: Track status (Saved, Applied, Interview, Offer, Rejected)
- **Admin Panel**: Manage search keywords, job sources, and documents
- **RSS Feed Ingestion**: Automatically fetch jobs from RSS feeds with deduplication
- **Manual Ingestion Trigger**: Run RSS ingestion on-demand from the admin panel
- **Authentication**: Secure admin-only access with Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

The project is already configured with Supabase connection details in the `.env` file.

3. **Database Setup**

The database schema has already been created with the following tables:
- `users` - Admin user accounts
- `keywords` - Search keywords for job hunting
- `sources` - Job sources (RSS feeds or manual)
- `documents` - Resumes and cover letters
- `jobs` - Job postings
- `applications` - Application tracking

4. **Create an admin user**

To create your first admin user, you need to:

a. Sign up through Supabase Auth:
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Users
   - Click "Add User" and create a user with your email and password

b. Add the user to the `users` table:
   - Run this SQL query in the Supabase SQL Editor:
   ```sql
   INSERT INTO users (id, email)
   VALUES (
     'YOUR_USER_ID_FROM_AUTH_USERS',
     'your-email@example.com'
   );
   ```

5. **Run the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

6. **Login**

Navigate to `http://localhost:3000/login` and sign in with the admin credentials you created.

## Project Structure

```
├── app/
│   ├── admin/          # Admin panel for keywords, sources, documents
│   ├── dashboard/      # Dashboard with statistics
│   ├── jobs/           # Job listings and details
│   │   └── [id]/       # Individual job detail page
│   ├── login/          # Login page
│   └── layout.tsx      # Root layout with auth provider
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── app-layout.tsx  # Main app layout with sidebar
│   └── protected-route.tsx  # Auth guard component
└── lib/
    ├── supabase.ts     # Supabase client and types
    └── auth-context.tsx # Authentication context
```

## Pages

- `/login` - Admin login page
- `/dashboard` - Main dashboard with application statistics
- `/jobs` - Browse and search job listings
- `/jobs/[id]` - View job details and manage application status
- `/admin` - Manage keywords, sources, and documents

## Database Schema

### Users
- Admin-only authentication
- Linked to Supabase Auth users

### Keywords
- Search phrases with location and experience level filters
- Remote-only flag

### Sources
- RSS feeds or manual entry points
- Enable/disable toggle
- Tracks last run time and error status for RSS feeds

### Documents
- Resume and cover letter storage
- Supports file upload (future feature)

### Jobs
- Job postings with title, company, location, description
- Optional link to external posting

### Applications
- Status tracking (Saved, Applied, Interview, Offer, Rejected)
- Notes and application date
- Linked to jobs

## RSS Feed Ingestion

The application includes automated RSS feed ingestion for job discovery:

### How It Works

1. **Add RSS Sources**: In the Admin panel, add RSS feed URLs under the Sources tab
2. **Enable Sources**: Toggle the switch to enable/disable individual RSS sources
3. **Manual Trigger**: Click "Run Ingestion Now" to immediately fetch jobs from all enabled RSS feeds
4. **Automatic Deduplication**: Jobs are deduplicated by URL to prevent duplicates
5. **Status Tracking**: View last run time and any errors for each RSS source

### Edge Function

The RSS ingestion is powered by a Supabase Edge Function (`ingest-rss`) that:
- Fetches RSS feeds with 30-second timeout
- Parses XML and extracts job information
- Inserts new jobs into the database
- Updates source status with last run time and errors
- Returns detailed logs of the ingestion process

### RSS Feed Format

The ingestion supports standard RSS feeds with the following fields:
- `title` - Job title (required)
- `link` - Job URL (required, used for deduplication)
- `description` - Job description
- `pubDate` - Publication date
- `company` - Company name (optional)
- `location` - Job location (optional)

## Building for Production

```bash
npm run build
```

## Security Features

- Row Level Security (RLS) enabled on all tables
- Admin-only access to all data
- Secure authentication with Supabase
- Protected routes with authentication guards

## Future Enhancements

- File upload for resumes and cover letters
- Scheduled RSS ingestion (daily/hourly automation via cron)
- Email notifications for status changes
- Application timeline view
- Export application data
- Advanced RSS feed filters using keywords
- Job recommendation engine
