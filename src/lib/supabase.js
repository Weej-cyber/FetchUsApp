import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rwauwkrdzcesyhwpaeow.supabase.co'
const supabaseAnonKey = 'sb_publishable_eXLygIqAXfuXO6dYHwz0pA_iSC0dec4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})
