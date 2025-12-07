
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

async function unlockSessions() {
    console.log("Unlocking sessions for AI testing...");

    // 1. Couple Session (666...)
    const coupleCode = 'TEST01';
    const { data: couple } = await supabase.from('couple_sessions').select('*').eq('share_code', coupleCode).single();
    if (couple) {
        // Complete the couple session
        await supabase.from('couple_sessions').update({ status: 'completed' }).eq('id', couple.id);

        // Complete Initiator & Partner
        await supabase.from('assessment_sessions').update({ status: 'completed', payment_status: 'paid' }).eq('id', couple.initiator_session_id);
        if (couple.partner_session_id) {
            await supabase.from('assessment_sessions').update({ status: 'completed', payment_status: 'paid' }).eq('id', couple.partner_session_id);
        }
        console.log(`Unlocked Couple Session: ${coupleCode} (and participants)`);
    }

    // 2. Team Session (TEST02)
    const teamCode = 'TEST02';
    const { data: team } = await supabase.from('team_sessions').select('*').eq('share_code', teamCode).single();
    if (team) {
        // Complete team session
        await supabase.from('team_sessions').update({ status: 'completed' }).eq('id', team.id);

        // Complete Leader
        await supabase.from('assessment_sessions').update({ status: 'completed', payment_status: 'paid' }).eq('id', team.leader_session_id);

        // Complete Members (using parent_session_id = leader_session_id)
        await supabase.from('assessment_sessions').update({ status: 'completed', payment_status: 'paid' }).eq('parent_session_id', team.leader_session_id);

        console.log(`Unlocked Team Session: ${teamCode} (and members)`);
    }
}

unlockSessions();
