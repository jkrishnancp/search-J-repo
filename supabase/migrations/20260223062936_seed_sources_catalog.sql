/*
  # Seed Sources Catalog

  ## Overview
  Populate the sources table with a comprehensive catalog of job boards and ATS platforms.
  These are reference entries (is_catalog=true) that users can enable for their own use.

  ## Catalog Entries
  
  ### General Job Boards (HIGH risk - do not scrape)
  - LinkedIn Jobs, Indeed, Glassdoor, ZipRecruiter, Monster, CareerBuilder
  
  ### Tech/Startup Boards (HIGH risk)
  - Dice, Wellfound, Built In
  
  ### Cybersecurity Boards
  - ClearanceJobs
  
  ### Remote Work Boards (MEDIUM risk)
  - We Work Remotely, Remote OK, Remotive
  
  ### Government Jobs
  - USAJOBS
  
  ### Company ATS Platforms (LOW risk - adapter-specific)
  - Greenhouse, Lever, Workable, SmartRecruiters
  
  ### Aggregators (HIGH risk)
  - SimplyHired

  ## Important Notes
  - All catalog entries have is_catalog=true and default_enabled=false
  - Users will add actual URLs when enabling these sources
  - This script is idempotent - it only inserts if entries don't exist
*/

-- Insert catalog sources only if they don't already exist
INSERT INTO sources (name, type, category, adapter, homepage_url, robots_risk, default_enabled, enabled, is_catalog, url)
SELECT * FROM (VALUES
  -- General Job Boards (HIGH risk, adapter NONE)
  ('LinkedIn Jobs', 'MANUAL', 'GENERAL_BOARD', 'NONE', 'https://www.linkedin.com/jobs/', 'HIGH', false, false, true, null),
  ('Indeed', 'MANUAL', 'GENERAL_BOARD', 'NONE', 'https://www.indeed.com/', 'HIGH', false, false, true, null),
  ('Glassdoor', 'MANUAL', 'GENERAL_BOARD', 'NONE', 'https://www.glassdoor.com/Job/index.htm', 'HIGH', false, false, true, null),
  ('ZipRecruiter', 'MANUAL', 'GENERAL_BOARD', 'NONE', 'https://www.ziprecruiter.com/jobs', 'HIGH', false, false, true, null),
  ('Monster', 'MANUAL', 'GENERAL_BOARD', 'NONE', 'https://www.monster.com/jobs/', 'HIGH', false, false, true, null),
  ('CareerBuilder', 'MANUAL', 'GENERAL_BOARD', 'NONE', 'https://www.careerbuilder.com/', 'HIGH', false, false, true, null),
  
  -- Tech/Startup Boards (HIGH risk)
  ('Dice', 'MANUAL', 'TECH_BOARD', 'NONE', 'https://www.dice.com/', 'HIGH', false, false, true, null),
  ('Wellfound (AngelList)', 'MANUAL', 'TECH_BOARD', 'NONE', 'https://wellfound.com/jobs', 'HIGH', false, false, true, null),
  ('Built In', 'MANUAL', 'TECH_BOARD', 'NONE', 'https://builtin.com/jobs', 'HIGH', false, false, true, null),
  
  -- Cybersecurity Boards (HIGH risk)
  ('ClearanceJobs', 'MANUAL', 'CYBER_BOARD', 'NONE', 'https://www.clearancejobs.com/', 'HIGH', false, false, true, null),
  
  -- Remote Work Boards (MEDIUM risk)
  ('We Work Remotely', 'MANUAL', 'REMOTE_BOARD', 'NONE', 'https://weworkremotely.com/', 'MEDIUM', false, false, true, null),
  ('Remote OK', 'MANUAL', 'REMOTE_BOARD', 'NONE', 'https://remoteok.com/', 'MEDIUM', false, false, true, null),
  ('Remotive', 'MANUAL', 'REMOTE_BOARD', 'NONE', 'https://remotive.com/', 'MEDIUM', false, false, true, null),
  
  -- Government Jobs (HIGH risk)
  ('USAJOBS', 'MANUAL', 'GOVERNMENT', 'NONE', 'https://www.usajobs.gov/', 'HIGH', false, false, true, null),
  
  -- Company ATS Platforms (LOW risk, adapter-specific)
  ('Greenhouse', 'MANUAL', 'COMPANY_ATS', 'ATS_GREENHOUSE', 'https://www.greenhouse.io/', 'LOW', false, false, true, null),
  ('Lever', 'MANUAL', 'COMPANY_ATS', 'ATS_LEVER', 'https://www.lever.co/', 'LOW', false, false, true, null),
  ('Workable', 'MANUAL', 'COMPANY_ATS', 'ATS_WORKABLE', 'https://www.workable.com/', 'LOW', false, false, true, null),
  ('SmartRecruiters', 'MANUAL', 'COMPANY_ATS', 'ATS_SMARTRECRUITERS', 'https://www.smartrecruiters.com/', 'LOW', false, false, true, null),
  
  -- Aggregators (HIGH risk)
  ('SimplyHired', 'MANUAL', 'AGGREGATOR', 'NONE', 'https://www.simplyhired.com/', 'HIGH', false, false, true, null)
) AS catalog_data(name, type, category, adapter, homepage_url, robots_risk, default_enabled, enabled, is_catalog, url)
WHERE NOT EXISTS (
  SELECT 1 FROM sources WHERE sources.name = catalog_data.name AND sources.is_catalog = true
);