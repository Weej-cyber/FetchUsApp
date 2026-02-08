import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rwauwkrdzcesyhwpaeow.supabase.co'
const supabaseAnonKey = 'sb_publishable_eXLygIqAXfuXO6dYHwz0pA_iSC0dec4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations (database setup)
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3YXV3a3JkemNlc3lod3BhZW93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTgwODIyNywiZXhwIjoyMDg1Mzg0MjI3fQ.bRMPmKnuhdlxYBnS65bpmzUo2fciyuscGfgCH2_siPc'

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
