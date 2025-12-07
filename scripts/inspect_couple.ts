
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

async function inspectCouple() {
    const shareCode = 'TEST01';
    const { data: couple } = await supabase.from('couple_sessions').select('*').eq('share_code', shareCode).single();
    if (!couple) {
        console.log("No couple found for TEST01");
        return;
    }
    console.log("Couple Session:", couple);

    if (couple.partner_session_id) {
        const { data: partner } = await supabase.from('assessment_sessions').select('*').eq('id', couple.partner_session_id).single();
        console.log("Partner Session:", partner);
    } else {
        console.log("Partner ID is NULL in couple_sessions");
    }
}

inspectCouple();
