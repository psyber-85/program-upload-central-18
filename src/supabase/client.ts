
import { createClient } from '@supabase/supabase-js';

// Use the same values as in the src/integrations/supabase/client.ts
const SUPABASE_URL = "https://nxnpjkthtjaqamrriogp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bnBqa3RodGphcWFtcnJpb2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MTQwNjQsImV4cCI6MjA2MzE5MDA2NH0.ukmvfRYx55Yiw6-8hqLps0jAcaDs7p6Eg5xOtpJoQNs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
