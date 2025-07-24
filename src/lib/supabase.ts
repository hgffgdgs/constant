import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database table names
export const TABLES = {
  USERS: 'users',
  REPORTS: 'reports',
  INVOLVED_PERSONS: 'involved_persons',
  PHOTOS: 'photos',
  AUDIO_NOTES: 'audio_notes',
  REPORT_ACTIVITIES: 'report_activities',
} as const;

// Storage bucket names
export const BUCKETS = {
  PHOTOS: 'photos',
  AUDIO: 'audio',
  PDFS: 'pdfs',
  SIGNATURES: 'signatures',
} as const;