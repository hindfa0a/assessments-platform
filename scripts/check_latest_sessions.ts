
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

console.log("My Local URL:", supabaseUrl);

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSessions() {
    console.log("Checking latest 10 assessment sessions...");

    const { data: requestSessions, error } = await supabase
        .from('assessment_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching sessions:", error);
        return;
    }

    if (requestSessions && requestSessions.length > 0) {
        console.log("Latest Session Data:", JSON.stringify(requestSessions[0], null, 2));
    }

    console.table(requestSessions?.map(s => ({
        id: s.id,
        user_id: s.user_id,
        use_case: s.use_case,
        status: s.status,
        created_at: s.created_at
    })));
}

checkSessions();
