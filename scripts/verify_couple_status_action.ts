
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

async function verifyAction() {
    const sessionId = '666bcd25-c2e8-4269-83ce-f966a0ec1f17';

    // Simulate checkSessionCoupleStatus
    const { data: coupleAsInitiator, error } = await supabase
        .from('couple_sessions')
        .select(`*, initiator:assessment_sessions!initiator_session_id(status), partner:assessment_sessions!partner_session_id(status)`)
        .eq('initiator_session_id', sessionId)
        .single();

    console.log("Raw Query Result:", { coupleAsInitiator, error });

    if (coupleAsInitiator) {
        // const initiatorDone = true; 
        const partnerDone = coupleAsInitiator.partner?.status === 'completed';
        console.log("Calculated Logic:", {
            partnerObj: coupleAsInitiator.partner,
            partnerStatus: coupleAsInitiator.partner?.status,
            partnerDone
        });
    }
}

verifyAction();
