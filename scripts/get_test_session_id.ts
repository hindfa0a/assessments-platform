
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

async function getSession() {
    const { data: couple } = await supabase.from('couple_sessions').select('*').eq('share_code', 'TEST01').single();
    if (couple) {
        console.log(`SESSION_ID=${couple.initiator_session_id}`);
    } else {
        console.log("No session found for TEST01");
    }
}

getSession();
