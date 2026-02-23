/*
  # JobApplyTracker Database Schema

  ## Overview
  Complete database schema for job application tracking system with admin authentication.

  ## New Tables
  
  ### `users`
  Admin user table for authentication
  - `id` (uuid, primary key) - User identifier, matches auth.users
  - `email` (text, unique) - Admin email address
  - `created_at` (timestamptz) - Account creation timestamp

  ### `keywords`
  Search keywords for job hunting
  - `id` (uuid, primary key) - Keyword identifier
  - `phrase` (text) - Search phrase/keyword
  - `location` (text, nullable) - Location filter
  - `remote_only` (boolean) - Remote jobs only flag
  - `level` (text) - Experience level (ENTRY, MID, SENIOR, LEAD, EXECUTIVE)
  - `created_at` (timestamptz) - Creation timestamp

  ### `sources`
  Job sources (RSS feeds or manual entry)
  - `id` (uuid, primary key) - Source identifier
  - `name` (text) - Source name
  - `type` (text) - Source type (RSS, MANUAL)
  - `url` (text, nullable) - RSS feed URL
  - `enabled` (boolean) - Active status
  - `created_at` (timestamptz) - Creation timestamp

  ### `documents`
  Resume and cover letter storage
  - `id` (uuid, primary key) - Document identifier
  - `type` (text) - Document type (RESUME, COVER_LETTER)
  - `filename` (text) - Original filename
  - `storage_path` (text) - Supabase storage path
  - `text_content` (text, nullable) - Extracted text content
  - `created_at` (timestamptz) - Upload timestamp

  ### `jobs`
  Job postings
  - `id` (uuid, primary key) - Job identifier
  - `title` (text) - Job title
  - `company` (text) - Company name
  - `location` (text, nullable) - Job location
  - `url` (text, nullable) - Job posting URL
  - `source_id` (uuid, nullable) - Reference to sources table
  - `description` (text, nullable) - Job description
  - `date_posted` (timestamptz, nullable) - Original posting date
  - `created_at` (timestamptz) - Record creation timestamp

  ### `applications`
  Job application tracking
  - `id` (uuid, primary key) - Application identifier
  - `job_id` (uuid) - Reference to jobs table
  - `status` (text) - Application status (SAVED, APPLIED, INTERVIEW, OFFER, REJECTED)
  - `applied_at` (timestamptz, nullable) - Application submission date
  - `notes` (text, nullable) - Application notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Only authenticated admin users can access data
  - All policies check auth.uid() matches a user in users table
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

-- Create keywords table
CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase text NOT NULL,
  location text,
  remote_only boolean DEFAULT false,
  level text NOT NULL DEFAULT 'MID',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT keywords_level_check CHECK (level IN ('ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'))
);

ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read keywords"
  ON keywords FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert keywords"
  ON keywords FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can update keywords"
  ON keywords FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can delete keywords"
  ON keywords FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

-- Create sources table
CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'MANUAL',
  url text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT sources_type_check CHECK (type IN ('RSS', 'MANUAL'))
);

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sources"
  ON sources FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert sources"
  ON sources FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can update sources"
  ON sources FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can delete sources"
  ON sources FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  filename text NOT NULL,
  storage_path text NOT NULL,
  text_content text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT documents_type_check CHECK (type IN ('RESUME', 'COVER_LETTER'))
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text,
  url text,
  source_id uuid REFERENCES sources(id) ON DELETE SET NULL,
  description text,
  date_posted timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can update jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can delete jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'SAVED',
  applied_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT applications_status_check CHECK (status IN ('SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'))
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can delete applications"
  ON applications FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_source_id ON jobs(source_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for applications table
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();