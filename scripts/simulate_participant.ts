
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env manual (no dotenv dep)
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simulateParticipant(shareCode: string, role: 'initiator' | 'partner' | 'member' | 'leader', name: string) {
    console.log(`\n--- Simulating ${role} (${name}) for Code: ${shareCode} ---`);

    // 1. Identify Session Type & Parent
    let parentSessionId: string | null = null;
    let useCase: string = '';

    // Determine Use Case based on Role if Initiator/Leader
    if (role === 'initiator') useCase = 'couples';
    else if (role === 'leader') useCase = 'teams';

    // For Partner/Member, we need to find the parent first
    let coupleSession = null; // Scope variable
    let teamSession = null;

    if (role === 'partner' || role === 'member') {
        // Check Couples
        const { data: cs } = await supabase
            .from('couple_sessions')
            .select('*')
            .eq('share_code', shareCode)
            .single();
        coupleSession = cs;

        if (coupleSession) {
            console.log("Found Couple Session:", coupleSession.id);
            parentSessionId = coupleSession.initiator_session_id;
            useCase = 'couples';
            if (role !== 'partner') console.warn("Role mismatch: Found couple session but role is", role);
        } else {
            // Check Teams
            const { data: ts } = await supabase
                .from('team_sessions')
                .select('*')
                .eq('share_code', shareCode)
                .single();
            teamSession = ts;

            if (teamSession) {
                console.log("Found Team Session:", teamSession.id);
                parentSessionId = teamSession.leader_session_id;
                useCase = 'teams';
            } else {
                console.error("Invalid Share Code: Not found in couples or teams.");
                process.exit(1);
            }
        }
    }

    // 2. Create Dummy User
    const email = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@test.com`;
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'Password123!',
        email_confirm: true
    });

    if (authError || !authUser.user) {
        console.error("Auth User Creation Failed:", authError);
        process.exit(1);
    }
    console.log("Created Dummy User:", authUser.user.id);
    console.log("EMAIL=" + email);

    // 2b. Insert into public.users (Required by FK)
    const { error: profileError } = await supabase
        .from('users')
        .insert({
            id: authUser.user.id,
            email: email,
            name: name
        });

    if (profileError) {
        console.error("Profile Creation Failed:", profileError);
        // Continue? Might fail next step.
    }

    // 3. Create Session Record
    const { data: newSession, error: sessionError } = await supabase
        .from('assessment_sessions')
        .insert({
            user_id: authUser.user.id,
            use_case: useCase,
            status: 'completed', // Immediately complete
            session_type: (useCase === 'couples') ? 'couple' : 'team',
            participant_role: role,
            participant_name: name,
            // Link appropriately
            parent_session_id: role === 'member' ? parentSessionId : null,
            share_code: shareCode,
            completed_at: new Date().toISOString()
        })
        .select()
        .single();

    if (sessionError || !newSession) {
        console.error("Session Creation Failed:", sessionError);
        process.exit(1);
    }
    console.log("Created Assessment Session:", newSession.id);
    console.log("SESSION_ID=" + newSession.id); // OUTPUT FOR PARSING

    // 4. Upgrade if Initiator/Leader
    if (role === 'initiator') {
        await supabase.from('assessment_sessions').update({ share_code: shareCode }).eq('id', newSession.id);
        await supabase.from('couple_sessions').insert({
            share_code: shareCode,
            initiator_session_id: newSession.id,
            status: 'waiting_partner'
        });
        console.log("Created Couple Session Record");
    } else if (role === 'leader') {
        await supabase.from('assessment_sessions').update({ share_code: shareCode }).eq('id', newSession.id);
        await supabase.from('team_sessions').insert({
            share_code: shareCode,
            leader_session_id: newSession.id,
            team_name: name + "'s Team",
            status: 'collecting'
        });
        console.log("Created Team Session Record");
    }

    // 4b. Link back if Partner (Update Couple Session)
    if (role === 'partner' && coupleSession) {
        await supabase
            .from('couple_sessions')
            .update({ partner_session_id: newSession.id })
            .eq('id', coupleSession.id);
        console.log("Linked to Couple Session");
    }

    // 5. Submit Dummy Answers (Validated via script earlier? No, just random 'Agree')
    // We need to know which tools to answer.
    // Couples: attachment, love_languages
    // Teams: strengths, eq, conflict_styles

    const tools = useCase === 'couples'
        ? ['attachment', 'love_languages']
        : ['strengths', 'eq', 'conflict_styles'];

    console.log("Generating answers for tools:", tools);

    // We need question IDs. We'll just fetch a few from DB answers or Questions JSON? 
    // Actually, `user_answers` table needs `question_id`.
    // Let's read `questions.json` or just fetch ALL questions from `questions.json` artifact logic?
    // Easiest is to import questions from `src/lib/assessments/questions.json` via require.

    // NOTE: This script runs in node, so we can require the json directly if path is correct.
    // Or we just make up question IDs? No, constraints might reference them if we had FKs (we don't usually on questions).
    // But scoring engines need valid IDs.
    // Let's just insert "Generic" answers valid enough for "Completed" status.
    // Actually, the scoring engine runs on READ. If we want AI analysis to work, we need answers that produce a score.
    // The previous validation script `validate_all_assessments.ts` has the logic to generate answers.
    // Let's just insert answers for ALL questions of those tools with value=1 (Agree).

    const questionsPath = path.resolve(process.cwd(), 'src/lib/assessments/questions.json');
    const questionsData = require(questionsPath).assessments; // Fixed path access

    let answersToInsert: any[] = [];

    for (const tool of tools) {
        // Map tool name to JSON key. 
        // attachment -> attachment_style
        // love_languages -> love_languages
        // strengths -> strengths
        // eq -> emotional_intelligence
        // conflict_styles -> conflict_styles

        let jsonKey = tool;
        if (tool === 'attachment') jsonKey = 'attachment_style';
        if (tool === 'eq') jsonKey = 'emotional_intelligence';

        const toolData = questionsData[jsonKey];
        if (!toolData) {
            console.warn(`Tool ${jsonKey} not found in JSON`);
            continue;
        }

        const qs = toolData.questions;
        qs.forEach((q: any) => {
            answersToInsert.push({
                session_id: newSession.id,
                question_id: q.id,
                assessment_type: tool,
                answer_value: 1, // Agree
                response_time_ms: 100
            });
        });
    }

    if (answersToInsert.length > 0) {
        const { error: ansError } = await supabase
            .from('user_answers')
            .insert(answersToInsert);

        if (ansError) {
            console.error("Answer Insert Failed:", ansError);
        } else {
            console.log(`Inserted ${answersToInsert.length} answers.`);
        }
    }

    console.log("--- Simulation Complete ---");
}

// CLI Args
const args = process.argv.slice(2); // [code, role, name, --delay, ms]
if (args.length < 3) {
    console.log("Usage: npx tsx scripts/simulate_participant.ts <CODE> <ROLE> <NAME> [--delay <ms>]");
    console.log("Roles: initiator, partner, member, leader");
} else {
    const code = args[0];
    const role = args[1] as 'initiator' | 'partner' | 'member' | 'leader';
    const name = args[2];

    let delay = 0;
    const delayIdx = args.indexOf('--delay');
    if (delayIdx !== -1 && args[delayIdx + 1]) {
        delay = parseInt(args[delayIdx + 1]);
    }

    if (delay > 0) {
        console.log(`Waiting ${delay}ms before starting...`);
        setTimeout(() => simulateParticipant(code, role, name), delay);
    } else {
        simulateParticipant(code, role, name);
    }
}
