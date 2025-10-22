import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;

if (!supabaseUrl) {
    console.error("VITE_SUPABASE_URL environment variable is required but not set.");
} else if (!supabaseKey) {
    console.error("VITE_SUPABASE_ANON_KEY environment variable is required but not set.");
} else {
    try {
        new URL(supabaseUrl);
        supabase = createClient(supabaseUrl, supabaseKey);
    } catch {
        console.error("VITE_SUPABASE_URL must be a valid URL.");
    }
}

export { supabase };
