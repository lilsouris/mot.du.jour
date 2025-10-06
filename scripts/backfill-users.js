#!/usr/bin/env node
/*
 Backfill missing rows in public.users from Supabase auth.users.

 Usage:
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-users.js [--dry-run]

 Requirements:
   - Service role key (never expose on client!)
   - Row policies should allow service_role to insert/select on public.users
*/

const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dryRun = process.argv.includes('--dry-run');

  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  console.log('Fetching auth users...');
  const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error('Failed to list auth users:', authErr.message);
    process.exit(1);
  }

  console.log(`Found ${authUsers.users.length} auth users. Checking public.users...`);
  let toInsert = [];
  for (const au of authUsers.users) {
    const { data: row, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', au.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Ignore not found, but surface other errors
      console.warn('Lookup error for', au.id, error.message);
    }

    if (!row) {
      toInsert.push({
        id: au.id,
        email: au.email,
        name: (au.email || '').split('@')[0] || null,
        role: 'owner'
      });
    }
  }

  console.log(`Missing rows: ${toInsert.length}`);
  if (toInsert.length === 0) {
    console.log('Nothing to backfill. Done.');
    return;
  }

  if (dryRun) {
    console.log('--dry-run specified, not inserting. Sample:', toInsert.slice(0, 3));
    return;
  }

  const { error: insertErr } = await supabase.from('users').insert(toInsert);
  if (insertErr) {
    console.error('Insert error:', insertErr.message, insertErr);
    process.exit(1);
  }

  console.log('Backfill completed. Inserted:', toInsert.length);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});


