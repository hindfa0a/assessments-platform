
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env manual
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createExpiredSession() {
    console.log("Creating expired session...");

    // 1. Create Dummy User
    const email = `expired_${Date.now()}@test.com`;
    const { data: authUser } = await supabase.auth.admin.createUser({
        email,
        password: 'Password123!',
        email_confirm: true
    });

    if (!authUser.user) return console.error("Auth failed");

    await supabase.from('users').insert({ id: authUser.user.id, email, name: 'Expired User' });

    // 2. Create Session with old date (30 days ago)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 30);

    const shareCode = "EXP001";

    const { data: session } = await supabase
        .from('assessment_sessions')
        .insert({
            user_id: authUser.user.id,
            use_case: 'couples',
            status: 'in_progress',
            session_type: 'couple',
            participant_role: 'initiator',
            participant_name: 'Expired Initiator',
            share_code: shareCode,
            created_at: oldDate.toISOString()
        })
        .select()
        .single();

    // Create Couple Session
    await supabase.from('couple_sessions').insert({
        share_code: shareCode,
        initiator_session_id: session.id,
        created_at: oldDate.toISOString(),
        expires_at: oldDate.toISOString() // Explicitly expired
    });

    console.log(`Created Expired Session. Code: ${shareCode}`);
}

createExpiredSession();
