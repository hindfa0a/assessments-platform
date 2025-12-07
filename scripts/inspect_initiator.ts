
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

async function inspectInitiator() {
    const sessionId = '666bcd25-c2e8-4269-83ce-f966a0ec1f17';
    const { data: session } = await supabase.from('assessment_sessions').select('*').eq('id', sessionId).single();

    if (!session) {
        console.log("Session not found");
        return;
    }

    console.log("Initiator Session:", {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        share_code: session.share_code
    });
}

inspectInitiator();
