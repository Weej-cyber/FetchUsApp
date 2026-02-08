import { supabaseAdmin } from './supabase'

export async function setupDatabase() {
  const results = {
    success: false,
    steps: [],
    errors: []
  }

  try {
    // 1. Create users table
    results.steps.push('Creating users table...')
    const { error: usersError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('client', 'walker', 'admin')),
          address TEXT,
          home_access_instructions TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (usersError) throw new Error(`Users table: ${usersError.message}`)
    results.steps.push('✓ Users table created')

    // 2. Create dogs table
    results.steps.push('Creating dogs table...')
    const { error: dogsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS dogs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          breed TEXT,
          age INTEGER,
          photo_url TEXT,
          vet_contact TEXT,
          behavioral_notes TEXT,
          medical_needs TEXT,
          medications TEXT,
          allergies TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (dogsError) throw new Error(`Dogs table: ${dogsError.message}`)
    results.steps.push('✓ Dogs table created')

    // 3. Create walks table
    results.steps.push('Creating walks table...')
    const { error: walksError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS walks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          walker_id UUID REFERENCES users(id) ON DELETE SET NULL,
          dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
          service_type TEXT NOT NULL,
          scheduled_date DATE NOT NULL,
          scheduled_time_start TIME,
          scheduled_time_end TIME,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
          notes TEXT,
          actual_start_time TIMESTAMP WITH TIME ZONE,
          actual_end_time TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    if (walksError) throw new Error(`Walks table: ${walksError.message}`)
    results.steps.push('✓ Walks table created')

    // 4. Create walk_locations table (for GPS tracking)
    results.steps.push('Creating walk_locations table...')
    const { error: locationsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS walk_locations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          walk_id UUID NOT NULL REFERENCES walks(id) ON DELETE CASCADE,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          accuracy DECIMAL(10, 2),
          recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_walk_locations_walk_id ON walk_locations(walk_id);
        CREATE INDEX IF NOT EXISTS idx_walk_locations_recorded_at ON walk_locations(recorded_at);
      `
    })
    if (locationsError) throw new Error(`Walk locations table: ${locationsError.message}`)
    results.steps.push('✓ Walk locations table created')

    // 5. Create walk_reports table
    results.steps.push('Creating walk_reports table...')
    const { error: reportsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS walk_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          walk_id UUID NOT NULL REFERENCES walks(id) ON DELETE CASCADE,
          walker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          photo_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_walk_reports_walk_id ON walk_reports(walk_id);
        CREATE INDEX IF NOT EXISTS idx_walk_reports_dog_id ON walk_reports(dog_id);
      `
    })
    if (reportsError) throw new Error(`Walk reports table: ${reportsError.message}`)
    results.steps.push('✓ Walk reports table created')

    // 6. Create broadcast_messages table
    results.steps.push('Creating broadcast_messages table...')
    const { error: broadcastError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS broadcast_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          message_text TEXT NOT NULL,
          recipient_type TEXT NOT NULL CHECK (recipient_type IN ('clients', 'walkers', 'all')),
          sent_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_broadcast_messages_sent_at ON broadcast_messages(sent_at DESC);
      `
    })
    if (broadcastError) throw new Error(`Broadcast messages table: ${broadcastError.message}`)
    results.steps.push('✓ Broadcast messages table created')

    // 7. Create notifications table (SMS log)
    results.steps.push('Creating notifications table...')
    const { error: notificationsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          notification_type TEXT NOT NULL,
          message TEXT NOT NULL,
          phone_number TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
          sent_at TIMESTAMP WITH TIME ZONE,
          error_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
      `
    })
    if (notificationsError) throw new Error(`Notifications table: ${notificationsError.message}`)
    results.steps.push('✓ Notifications table created')

    // 8. Create storage buckets
    results.steps.push('Creating storage buckets...')
    const { error: bucketsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('dog-photos', 'dog-photos', true)
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('walk-photos', 'walk-photos', true)
        ON CONFLICT (id) DO NOTHING;
      `
    })
    if (bucketsError) throw new Error(`Storage buckets: ${bucketsError.message}`)
    results.steps.push('✓ Storage buckets created')

    // 9. Set up Row Level Security policies
    results.steps.push('Setting up security policies...')
    const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Enable RLS on all tables
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE walks ENABLE ROW LEVEL SECURITY;
        ALTER TABLE walk_locations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE walk_reports ENABLE ROW LEVEL SECURITY;
        ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        
        -- Users policies
        CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON users
          FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON users
          FOR UPDATE USING (auth.uid() = id);
        
        -- Dogs policies
        CREATE POLICY IF NOT EXISTS "Clients can view their own dogs" ON dogs
          FOR SELECT USING (owner_id = auth.uid());
        
        CREATE POLICY IF NOT EXISTS "Walkers can view assigned dogs" ON dogs
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM walks
              WHERE walks.dog_id = dogs.id
              AND walks.walker_id = auth.uid()
            )
          );
        
        -- Walks policies
        CREATE POLICY IF NOT EXISTS "Clients can view their walks" ON walks
          FOR SELECT USING (client_id = auth.uid());
        
        CREATE POLICY IF NOT EXISTS "Walkers can view assigned walks" ON walks
          FOR SELECT USING (walker_id = auth.uid());
        
        -- Walk locations policies (for GPS tracking)
        CREATE POLICY IF NOT EXISTS "Walkers can insert locations for their walks" ON walk_locations
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM walks
              WHERE walks.id = walk_locations.walk_id
              AND walks.walker_id = auth.uid()
            )
          );
        
        CREATE POLICY IF NOT EXISTS "Clients can view locations for their walks" ON walk_locations
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM walks
              WHERE walks.id = walk_locations.walk_id
              AND walks.client_id = auth.uid()
            )
          );
        
        -- Walk reports policies
        CREATE POLICY IF NOT EXISTS "Walkers can create reports" ON walk_reports
          FOR INSERT WITH CHECK (walker_id = auth.uid());
        
        CREATE POLICY IF NOT EXISTS "Clients can view reports for their dogs" ON walk_reports
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM dogs
              WHERE dogs.id = walk_reports.dog_id
              AND dogs.owner_id = auth.uid()
            )
          );
        
        -- Broadcast messages policies
        CREATE POLICY IF NOT EXISTS "Users can view relevant broadcasts" ON broadcast_messages
          FOR SELECT USING (
            recipient_type = 'all'
            OR (recipient_type = 'clients' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'client'))
            OR (recipient_type = 'walkers' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'walker'))
          );
        
        -- Storage policies
        CREATE POLICY IF NOT EXISTS "Anyone can view dog photos" ON storage.objects
          FOR SELECT USING (bucket_id = 'dog-photos');
        
        CREATE POLICY IF NOT EXISTS "Users can upload dog photos" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'dog-photos');
        
        CREATE POLICY IF NOT EXISTS "Anyone can view walk photos" ON storage.objects
          FOR SELECT USING (bucket_id = 'walk-photos');
        
        CREATE POLICY IF NOT EXISTS "Walkers can upload walk photos" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'walk-photos');
      `
    })
    if (rlsError) throw new Error(`Security policies: ${rlsError.message}`)
    results.steps.push('✓ Security policies configured')

    // 10. Insert test data
    results.steps.push('Creating test data...')
    const { error: testDataError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        -- Test users
        INSERT INTO users (email, name, role, phone)
        VALUES ('admin@fetchus.com', 'Admin User', 'admin', '555-0100')
        ON CONFLICT (email) DO NOTHING;
        
        INSERT INTO users (email, name, role, phone, address, home_access_instructions)
        VALUES ('sarah@example.com', 'Sarah Johnson', 'client', '555-1234', '123 Oak Street, Apt 4B', 'Gate code: 4521. Leashes hanging by front door.')
        ON CONFLICT (email) DO NOTHING;
        
        INSERT INTO users (email, name, role, phone)
        VALUES ('mike@fetchus.com', 'Mike Walker', 'walker', '555-5678')
        ON CONFLICT (email) DO NOTHING;
        
        -- Test dog (for Sarah)
        DO $$
        DECLARE
          sarah_id UUID;
          mike_id UUID;
          max_id UUID;
        BEGIN
          SELECT id INTO sarah_id FROM users WHERE email = 'sarah@example.com';
          SELECT id INTO mike_id FROM users WHERE email = 'mike@fetchus.com';
          
          IF sarah_id IS NOT NULL THEN
            INSERT INTO dogs (owner_id, name, breed, age, behavioral_notes)
            VALUES (sarah_id, 'Max', 'Golden Retriever', 4, 'Friendly but pulls on leash. Loves treats.')
            ON CONFLICT DO NOTHING
            RETURNING id INTO max_id;
            
            -- Test walk (scheduled for today)
            IF mike_id IS NOT NULL AND max_id IS NOT NULL THEN
              INSERT INTO walks (client_id, walker_id, dog_id, service_type, scheduled_date, scheduled_time_start, status)
              VALUES (sarah_id, mike_id, max_id, '30-min Walk', CURRENT_DATE, '14:00', 'confirmed')
              ON CONFLICT DO NOTHING;
            END IF;
          END IF;
        END $$;
      `
    })
    if (testDataError) throw new Error(`Test data: ${testDataError.message}`)
    results.steps.push('✓ Test data created')

    results.success = true
    results.steps.push('\n========================================')
    results.steps.push('✓ DATABASE SETUP COMPLETE!')
    results.steps.push('========================================')
    results.steps.push('\nCreated tables:')
    results.steps.push('  • users')
    results.steps.push('  • dogs')
    results.steps.push('  • walks')
    results.steps.push('  • walk_locations (GPS tracking)')
    results.steps.push('  • walk_reports')
    results.steps.push('  • broadcast_messages')
    results.steps.push('  • notifications (SMS log)')
    results.steps.push('\nStorage buckets:')
    results.steps.push('  • dog-photos')
    results.steps.push('  • walk-photos')
    results.steps.push('\nTest accounts created:')
    results.steps.push('  • admin@fetchus.com (admin)')
    results.steps.push('  • sarah@example.com (client)')
    results.steps.push('  • mike@fetchus.com (walker)')
    
  } catch (error) {
    results.errors.push(error.message)
  }

  return results
}

export async function checkDatabaseSetup() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)
    
    return !error
  } catch {
    return false
  }
}
