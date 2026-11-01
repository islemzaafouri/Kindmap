const SUPABASE_URL = 'https://gczsevmxhsqtrimzaezh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bCgcwumm12RqN5KmEjivLA_uF3prVjl';

// "supabase" is the global object loaded from the CDN script
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);