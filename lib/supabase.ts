import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
      keywords: {
        Row: {
          id: string;
          phrase: string;
          location: string | null;
          remote_only: boolean;
          level: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
          created_at: string;
        };
        Insert: {
          id?: string;
          phrase: string;
          location?: string | null;
          remote_only?: boolean;
          level?: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
          created_at?: string;
        };
        Update: {
          id?: string;
          phrase?: string;
          location?: string | null;
          remote_only?: boolean;
          level?: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
          created_at?: string;
        };
      };
      sources: {
        Row: {
          id: string;
          name: string;
          type: 'RSS' | 'MANUAL';
          url: string | null;
          enabled: boolean;
          created_at: string;
          last_run_at: string | null;
          last_error: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type?: 'RSS' | 'MANUAL';
          url?: string | null;
          enabled?: boolean;
          created_at?: string;
          last_run_at?: string | null;
          last_error?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'RSS' | 'MANUAL';
          url?: string | null;
          enabled?: boolean;
          created_at?: string;
          last_run_at?: string | null;
          last_error?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          type: 'RESUME' | 'COVER_LETTER';
          filename: string;
          storage_path: string;
          text_content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'RESUME' | 'COVER_LETTER';
          filename: string;
          storage_path: string;
          text_content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: 'RESUME' | 'COVER_LETTER';
          filename?: string;
          storage_path?: string;
          text_content?: string | null;
          created_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          company: string;
          location: string | null;
          url: string | null;
          source_id: string | null;
          description: string | null;
          date_posted: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          company: string;
          location?: string | null;
          url?: string | null;
          source_id?: string | null;
          description?: string | null;
          date_posted?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          company?: string;
          location?: string | null;
          url?: string | null;
          source_id?: string | null;
          description?: string | null;
          date_posted?: string | null;
          created_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          status: 'SAVED' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
          applied_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          status?: 'SAVED' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
          applied_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          status?: 'SAVED' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
          applied_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
