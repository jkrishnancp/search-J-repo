/*
  # Add RSS Ingestion Tracking to Sources

  ## Overview
  Add fields to track RSS ingestion results and timing for automated job discovery.

  ## Changes
  
  ### Update `sources` table
  - Add `last_run_at` (timestamptz, nullable) - Timestamp of last ingestion attempt
  - Add `last_error` (text, nullable) - Last error message if ingestion failed
  
  ## Purpose
  These fields enable tracking of RSS feed ingestion status, allowing admins to:
  - Monitor when feeds were last checked
  - Debug any ingestion errors
  - Ensure feeds are being processed regularly
*/

-- Add ingestion tracking fields to sources table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sources' AND column_name = 'last_run_at'
  ) THEN
    ALTER TABLE sources ADD COLUMN last_run_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sources' AND column_name = 'last_error'
  ) THEN
    ALTER TABLE sources ADD COLUMN last_error text;
  END IF;
END $$;