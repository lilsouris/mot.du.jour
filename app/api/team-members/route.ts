import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Numéro requis' }, { status: 400 });
    }
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: teamRow } = await supabase
      .from('teams')
      .upsert({ owner_id: user.id }, { onConflict: 'owner_id' })
      .select('id')
      .single();

    const teamId = teamRow?.id;

    const insertRow: any = {
      user_id: user.id,
      team_id: teamId,
      role: 'member',
      phone_number: phone,
      joined_at: new Date().toISOString(),
    };

    const { error: insertErr } = await supabase
      .from('team_members')
      .insert(insertRow);
    if (insertErr) {
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
