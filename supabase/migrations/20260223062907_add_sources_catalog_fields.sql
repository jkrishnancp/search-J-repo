/*
  # Sources Catalog Enhancement
  
  ## Overview
  Transform sources table to support a comprehensive job source catalog with adapters,
  categories, and ingestion strategies aligned with real-world job board architecture.

  ## Changes
  
  ### Update `sources` table
  Add catalog and adapter fields:
  - `category` (text) - Source category enum: GENERAL_BOARD, TECH_BOARD, CYBER_BOARD, 
    REMOTE_BOARD, GOVERNMENT, COMPANY_ATS, AGGREGATOR
  - `adapter` (text) - Ingestion adapter: NONE, RSS_ATOM, XML_GENERIC, JOBPOSTING_JSONLD,
    ATS_GREENHOUSE, ATS_LEVER, ATS_WORKABLE, ATS_SMARTRECRUITERS
  - `notes` (text, nullable) - Additional notes about the source
  - `homepage_url` (text, nullable) - Homepage URL for the job board/company
  - `robots_risk` (text) - Risk level: LOW, MEDIUM, HIGH (default MEDIUM)
  - `default_enabled` (boolean) - Whether source is enabled by default (default false)
  - `is_catalog` (boolean) - Marks reference-only catalog entries (default false)

  ## Purpose
  Enable users to browse a preloaded catalog of job sources and selectively enable them
  with appropriate adapters for safe, ethical job ingestion.

  ## Security
  - Maintains existing RLS policies
  - All fields are accessible to authenticated admin users
*/

-- Add new columns to sources table
DO $$
BEGIN
  -- Add category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sources' AND column_name = 'category'
  ) THEN
    ALTER TABLE sources ADD COLUMN category text DEFAULT 'GENERAL_BOARD';
    ALTER TABLE sources ADD CONSTRAINT sources_category_check 
      CHECK (category IN (
        'GENERAL_BOARD', 'TECH_BOARD', 'CYBER_BOARD', 'REMOTE_BOARD', 
        'GOVERNMENT', 'COMPANY_ATS', 'AGGREGATOR'
      ));
  END IF;

  -- Add adapter column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sources' AND column_name = 'adapter'
  ) THEN
    ALTER TABLE sources ADD COLUMN adapter text DEFAULT 'NONE';
    ALTER TABLE sources ADD CONSTRAINT sources_adapter_check 
      CHECK (adapter IN (
        'NONE', 'RSS_ATOM', 'XML_GENERIC', 'JOBPOSTING_JSONLD',
        'ATS_GREENHOUSE', 'ATS_LEVER', 'ATS_WORKABLE', 'ATS_SMARTRECRUITERS'
      ));
  END IF;

  -- Add notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sources' AND column_name = 'notes'
  ) THEN
    ALTER TABLE sources ADD COLUMN notes text;
  END IF;

  -- Add homepage_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sources' AND column_name = 'homepage_url'
  ) THEN
    ALTER TABLE sources ADD COLUMN homepage_url text;
  END IF;

  -- Add robots_risk column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sources' AND column_name = 'robots_risk'
  ) THEN
    ALTER TABLE sources ADD COLUMN robots_risk text DEFAULT 'MEDIUM';
    ALTER TABLE sources ADD CONSTRAINT sources_robots_risk_check 
      CHECK (robots_risk IN ('LOW', 'MEDIUM', 'HIGH'));
  END IF;

  -- Add default_enabled column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sources' AND column_name = 'default_enabled'
  ) THEN
    ALTER TABLE sources ADD COLUMN default_enabled boolean DEFAULT false;
  END IF;

  -- Add is_catalog column to distinguish catalog entries from user sources
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sources' AND column_name = 'is_catalog'
  ) THEN
    ALTER TABLE sources ADD COLUMN is_catalog boolean DEFAULT false;
  END IF;
END $$;

-- Create index for catalog queries
CREATE INDEX IF NOT EXISTS idx_sources_is_catalog ON sources(is_catalog);
CREATE INDEX IF NOT EXISTS idx_sources_category ON sources(category);
CREATE INDEX IF NOT EXISTS idx_sources_adapter ON sources(adapter);