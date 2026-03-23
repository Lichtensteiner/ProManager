import { createClient } from '@supabase/supabase-js';

// Les clés d'API fournies par l'utilisateur
const supabaseUrl = 'https://kshactzjarzxgvojglco.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzaGFjdHpqYXJ6eGd2b2pnbGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMjM3OTcsImV4cCI6MjA4OTc5OTc5N30.JRuOF4ubG3k1sPWhIlZMpLcaOd7mh1Leb-wGvsgo_24';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
