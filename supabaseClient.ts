import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    throw new Error("VITE_SUPABASE_URL environment variable is required but not set.");
}

if (!supabaseKey) {
    throw new Error("VITE_SUPABASE_ANON_KEY environment variable is required but not set.");
}

// Validate URL format
try {
    new URL(supabaseUrl);
} catch {
    throw new Error("VITE_SUPABASE_URL must be a valid URL.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
