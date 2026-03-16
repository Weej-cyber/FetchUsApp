import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rwauwkrdzcesyhwpaeow.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3YXV3a3JkemNlc3lod3BhZW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDgyMjcsImV4cCI6MjA4NTM4NDIyN30.kzLnCqdOcbXtMXJquxAzxwMlVhlFcYh1y2O5m8Uw1zs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})
