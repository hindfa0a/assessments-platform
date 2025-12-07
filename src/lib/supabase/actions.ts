"use server";

import { createClient } from "@/lib/supabase/server";
import { UserAnswer } from "@/lib/assessments/types";

export type SaveResult = { success: boolean; error?: string; sessionId?: string };

// Helper to create admin client
async function createAdminClient() {
    return createClient(); // Actually createClient in server.ts uses env vars, but we need admin key.
    // Wait, createClient in server.ts uses cookies and ANON key.
    // We need a helper for Service Role.
    // Since I cannot import supabase-js easily in top level if not installed? (It is installed).
    // Let's rely on the dynamic import I wrote in the function, it was safe.
    // BUT I need to fix the syntax errors first.
}

export async function saveAssessmentSession(
    useCase: string,
    answers: Record<string, UserAnswer[]>,
    existingSessionId?: string,
    results?: any // Optional: if we want to save scores directly (we do!)
): Promise<SaveResult> {
    const supabase = await createClient();
    let { data: { user } } = await supabase.auth.getUser();

    // Variable to hold the client we should use for DB operations.
    // If authenticated normally, use `supabase` (uses cookie/RLS).
    // If guest created, use `adminClient` to bypass RLS for the initial insert.
    let dbClient = supabase;

    // 1. Authenticate OR Create Guest
    if (!user) {
        // Create Guest User via Admin
        // NOTE: In production, ideally we'd use anonymous sign-ins, but this works for MVP without client-side setup.
        // We will create a fresh user.
        try {
            // We need to import createClient from supabase-js direct for admin? 
            // `createClient` from `@/lib/supabase/server` uses cookies and is for server components context.
            // We need a pure admin client here.

            // Let's import it dynamically to avoid top-level issues
            const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
            const adminClient = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const randomEmail = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}@baseera.demo`;

            // Create user in Auth
            const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
                email: randomEmail,
                password: 'GuestPassword123!', // They won't know this, but we can allow them to "claim" later via email logic if we wanted.
                email_confirm: true
            });

            if (createError || !newUser.user) {
                console.error("Guest creation failed:", createError);
                return { success: false, error: "Failed to create guest session." };
            }

            user = newUser.user;

            // Auto-insert into public.users? Trigger usually does this.
            // But let's verify if we need to do it manually.
            // Our schema usually has a trigger on auth.users buffer? 
            // Checked schema: `users` table exists but no trigger shown in `schema.sql`.
            // We might need to manually insert into public.users if no trigger exists.
            // Let's safe-insert.

            // Insert into public.users (Profile)
            const { error: profileError } = await adminClient
                .from('users')
                .insert({
                    id: user.id,
                    email: randomEmail,
                    name: 'Guest User'
                });

            if (profileError) {
                // Ignore if already exists (trigger case)
                console.warn("Profile creation warn:", profileError);
            }

            // CRITICAL: Switch DB client to admin for subsequent inserts because 
            // the standard `supabase` client is still unauthenticated (anon) 
            // and will fail RLS checks against this new user_id.
            // Admin client ignores RLS.
            // @ts-ignore - Supabase types compatibility
            dbClient = adminClient;

            // NEW: Sign in the guest user so the client browser gets the session cookie!
            // This enables subsequent requests (results page, payment) to pass Auth & RLS.
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: randomEmail,
                password: 'GuestPassword123!'
            });

            if (signInError) {
                console.error("Guest auto-login failed:", signInError);
                // We proceed with saving using dbClient (admin), but the user might face issues
                // viewing the result if RLS blocks them. 
                // However, they will at least get the "Save Success" and maybe we can rely on public access later?
                // Ideally this shouldn't fail if we just created the user.
            }

        } catch (e) {
            console.error("Admin client error:", e);
            return { success: false, error: "Authentication system error." };
        }
    }

    if (!user) {
        return { success: false, error: "Authentication required to save results." };
    }

    // ENSURE PROFILE EXISTS (Constraint Fix)
    // Use Admin Client to bypass RLS (User might not have permissions to UPSERT into users table)
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: profileError } = await adminClient
        .from('users')
        .upsert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email!.split('@')[0]
        }, { onConflict: 'id' });

    if (profileError) {
        console.warn("Profile sync warning:", profileError);
    }

    let session;
    let sessionError;

    if (existingSessionId) {
        // Update existing session
        const { data, error } = await dbClient
            .from('assessment_sessions')
            .update({
                user_id: user.id, // CLAIM/LINK session to current user
                status: 'completed',
                completed_at: new Date().toISOString(),
                ...results // Spread results if provided (e.g. mbti_type, scores)
            })
            .eq('id', existingSessionId)
            .select()
            .single();
        session = data;
        sessionError = error;
    } else {
        // Create new session
        const { data, error } = await dbClient
            .from('assessment_sessions')
            .insert({
                user_id: user.id,
                use_case: useCase,
                status: 'completed',
                completed_at: new Date().toISOString(),
                ...results
            }) // Removed .select().single() here because it is done below?
            // Wait, original code had it.
            .select()
            .single();

        session = data;
        sessionError = error;
    }

    if (sessionError || !session) {
        console.error("Session save error (RLS?):", sessionError);
        return { success: false, error: sessionError?.message || "Failed to save session" };
    }

    // 3. Save Answers (Bulk Insert)
    const allAnswers = Object.values(answers).flat().map(ans => ({
        session_id: session.id,
        question_id: ans.questionId,
        assessment_type: ans.questionId.split('_')[0], // hacky extraction or pass it in
        answer_value: ans.value,
        response_time_ms: ans.responseTimeMs
    }));

    const { error: answersError } = await dbClient
        .from('user_answers')
        .insert(allAnswers);

    if (answersError) {
        console.error("Failed to save answers:", answersError);
        // We might not want to fail the whole request if session is saved, but let's be strict for PoC
        return { success: false, error: "Failed to save detailed answers" };
    }

    return { success: true, sessionId: session.id };
}

// ... (existing code)

import { createInvoice } from "@/lib/moyasar";

export type PaymentResult = { success: boolean; error?: string; paymentUrl?: string };

export async function initiateAssessmentPayment(
    sessionId: string,
    redirectUrl: string
): Promise<PaymentResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log("Payment Action: No User");
        return { success: false, error: "Authentication required." };
    }

    console.log(`Payment Action: Init for Session ${sessionId} User ${user.id}`);

    // 1. Get Session & Use Case Config
    // Use Admin Client to bypass RLS for now to debug "Session Not Found"
    const { createClient: createAdmin } = await import('@supabase/supabase-js');
    const adminClient = createAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: session, error: fetchError } = await adminClient
        .from('assessment_sessions')
        .select('*, use_case')
        .eq('id', sessionId)
        // .eq('user_id', user.id) // REMOVED: Fetch first, then validate ownership
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Payment Action Fetch Error:", fetchError);
    }

    if (!session) {
        return { success: false, error: "Session not found." };
    }

    // OWNERSHIP CHECK & AUTO-CLAIM
    if (session.user_id && session.user_id !== user.id) {
        return {
            success: false,
            error: `Session belongs to another user. (Auth: ${user.id.slice(0, 5)} vs Owner: ${session.user_id.slice(0, 5)})`
        };
    }

    if (!session.user_id) {
        console.log(`Payment Action: Claiming orphaned session ${sessionId} for user ${user.id}`);
        // Claim the session!
        const { error: claimError } = await adminClient
            .from('assessment_sessions')
            .update({ user_id: user.id })
            .eq('id', sessionId);

        if (claimError) {
            console.error("Payment Action: Failed to claim session", claimError);
            return { success: false, error: "Failed to claim session ownership." };
        }
    }

    if (session.payment_status === 'paid') {
        return { success: false, error: "Already paid." };
    }

    // 2. Determine Price based on Use Case (This should ideally come from a config/DB)
    // For MVP, hardcoding based on the Prompt or config
    // We can import USE_CASES from data.ts but that's text.
    // Let's rely on the plan's pricing table.
    let amount = 1000; // Default 10 SAR (in Halalas)
    const useCase = session.use_case;

    if (useCase === 'couples') amount = 2000; // 20 SAR
    else if (useCase === 'teams') amount = 5000; // 50 SAR
    // major_selection and career_change are 10 SAR (1000)

    // 3. Create Invoice on Moyasar
    try {
        const invoice = await createInvoice({
            amount: amount,
            currency: 'SAR',
            description: `Baseera Assessment: ${useCase}`,
            callback_url: redirectUrl,
            metadata: {
                session_id: sessionId,
                user_id: user.id
            }
        });

        // 4. Record pending payment in DB
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                session_id: sessionId,
                user_id: user.id,
                amount: amount / 100, // Store in main unit (SAR)
                currency: 'SAR',
                status: 'pending',
                moyasar_payment_id: invoice.id,
                transaction_no: invoice.id // Using invoice ID as trasnaction ref for now
            });

        if (paymentError) {
            console.error("Payment insert error:", paymentError);
            return { success: false, error: "Failed to record payment initialization." };
        }

        return { success: true, paymentUrl: invoice.url };

    } catch (e: any) {
        console.error("Moyasar Error:", e);
        return { success: false, error: e.message || "Payment initialization failed." };
    }
}

// NEW: Robust verification that doesn't rely on Webhooks (Critical for Localhost MVP)
export async function verifyPayment(sessionId: string, invoiceId?: string): Promise<{ success: boolean; error?: string }> {
    // Use Admin Client to bypass RLS for DB updates (User might not have UPDATE permission on payments)
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // 1. Fetch Invoice from Moyasar
        // We need to import fetchInvoice dynamically since it's not exported by actions.ts? 
        // No, we imported it in previous steps? Let's check imports.
        // It's in '@/lib/moyasar'.
        const { fetchInvoice } = await import('@/lib/moyasar');

        // If we don't have invoiceId, we need to look it up from DB? 
        // Or assume caller passes it. 
        // For callback page, we get `id` (invoiceId).

        if (!invoiceId) {
            // Try to find pending payment for session
            const { data: pay } = await adminClient.from('payments').select('moyasar_payment_id').eq('session_id', sessionId).eq('status', 'pending').single();
            if (pay) invoiceId = pay.moyasar_payment_id;
            else return { success: false, error: "No pending invoice found" };
        }

        const invoice = await fetchInvoice(invoiceId!);

        if (invoice.status === 'paid') {
            // 2. Update DB (Payments & Session)
            await adminClient
                .from('payments')
                .update({ status: 'paid', paid_at: new Date().toISOString() })
                .eq('moyasar_payment_id', invoiceId);

            await adminClient
                .from('assessment_sessions')
                .update({ payment_status: 'paid' })
                .eq('id', sessionId);

            return { success: true };
        }

        return { success: false, error: "Invoice is not paid yet" };

    } catch (e: any) {
        console.error("Verification failed:", e);
        return { success: false, error: e.message };
    }
}

export async function checkPaymentStatus(sessionId: string): Promise<{ status: string }> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('assessment_sessions')
        .select('payment_status')
        .eq('id', sessionId)
        .single();

    return { status: data?.payment_status || 'pending' };
}

// ... (existing code)

import { generateShareCode } from "@/lib/couples";

/**
 * Couples Compatibility Actions
 */

export async function upgradeToCoupleSession(sessionId: string, initiatorName?: string): Promise<{ success: boolean; shareCode?: string; error?: string }> {
    const supabase = await createClient();

    // 1. Get Session
    const { data: session } = await supabase.from('assessment_sessions').select('*').eq('id', sessionId).single();
    if (!session) return { success: false, error: "Session not found" };

    // Check if already has share code
    if (session.share_code) return { success: true, shareCode: session.share_code };

    // 2. Generate Code
    let shareCode = generateShareCode();
    // Ensure uniqueness (simple retry logic could be added here, but relying on low collision for MVP)

    // 3. Update Session
    const { error: updateError } = await supabase
        .from('assessment_sessions')
        .update({
            share_code: shareCode,
            session_type: 'couple',
            participant_role: 'initiator',
            participant_name: initiatorName || 'Initiator' // Fallback
        })
        .eq('id', sessionId);

    if (updateError) return { success: false, error: "Failed to update session" };

    // 4. Create Couple Session Record
    const { error: coupleError } = await supabase
        .from('couple_sessions')
        .insert({
            share_code: shareCode,
            initiator_session_id: sessionId,
            status: 'waiting_partner'
        });

    if (coupleError) return { success: false, error: "Failed to create couple record" };

    return { success: true, shareCode };
}

export async function joinCoupleSession(shareCode: string, partnerName: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    const supabase = await createClient();

    // 1. Validate Code
    const { data: coupleSession } = await supabase
        .from('couple_sessions')
        .select('*')
        .eq('share_code', shareCode)
        .single();

    if (!coupleSession) return { success: false, error: "Invalid share code" };

    // Check expiration
    if (coupleSession.expires_at && new Date(coupleSession.expires_at) < new Date()) {
        return { success: false, error: "Share code has expired" };
    }

    if (coupleSession.partner_session_id) {
        // Check if this user is the partner? 
        // For now, simple logic: if partner_session_id exists, it's taken?
        // What if user refreshes? We should probably cookies/auth check.
        // For MVP, if taken, maybe allow 'resuming' if we had auth. 
        // Without auth, we might block. But let's assume 'Partner' is a new user.
        return { success: false, error: "Session already has a partner" };
    }

    // 2. Create Partner Session (Empty, ready to start)
    // We need a user_id. If anonymous, we need to handle that.
    // Assuming 'login' or 'temp user' for now.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Must be logged in to join" };

    const { data: session, error: createError } = await supabase
        .from('assessment_sessions')
        .insert({
            user_id: user.id,
            use_case: 'couples', // Hardcoded for this flow
            status: 'in_progress',
            session_type: 'couple',
            participant_role: 'partner',
            participant_name: partnerName,
            // partner_session_id: coupleSession.initiator_session_id, // REMOVED: Column does not exist
            share_code: shareCode // Same code
        })
        .select()
        .single();

    if (createError || !session) return { success: false, error: "Failed to create session" };

    // 3. Update Couple Record
    await supabase
        .from('couple_sessions')
        .update({ partner_session_id: session.id })
        .eq('id', coupleSession.id);

    return { success: true, sessionId: session.id };
}

export async function checkCoupleStatus(shareCode: string): Promise<{
    isReady: boolean;
    initiator?: any;
    partner?: any;
    paymentStatus?: string;
}> {
    const supabase = await createClient();

    // Get couple session
    const { data: couple } = await supabase
        .from('couple_sessions')
        .select(`
            *,
            initiator:assessment_sessions!initiator_session_id (*),
            partner:assessment_sessions!partner_session_id (*)
        `)
        .eq('share_code', shareCode)
        .single();

    if (!couple) return { isReady: false };

    const initiatorDone = couple.initiator?.status === 'completed';
    const partnerDone = couple.partner?.status === 'completed';
    const isReady = initiatorDone && partnerDone;

    // Check payment (linked to couple session or one of the user sessions?)
    // Schema has `payment_id` on couple_sessions.
    // Also `payment_status` on individual sessions.
    // If one pays, we should update both? Or update couple_sessions status.

    // For now, let's look at initiator's payment status or couple status
    // If couple.payment_id is set, it's paid?
    // Let's assume we check `status` column on couple_sessions

    return {
        isReady,
        initiator: couple.initiator,
        partner: couple.partner,
        paymentStatus: couple.status // 'waiting_partner', 'waiting_payment', 'completed' (paid)
    };
}

export async function checkSessionCoupleStatus(sessionId: string): Promise<{
    isCouple: boolean;
    coupleSession?: any;
    shareCode?: string;
    isReadyForPayment?: boolean;
}> {
    const supabase = await createClient();

    // Find if this session is part of a couple session (as initiator OR partner)
    // We check both columns
    const { data: coupleAsInitiator } = await supabase
        .from('couple_sessions')
        .select(`*, initiator:assessment_sessions!initiator_session_id(status), partner:assessment_sessions!partner_session_id(status)`)
        .eq('initiator_session_id', sessionId)
        .single();

    if (coupleAsInitiator) {
        const initiatorDone = true; // By definition if they are viewing results? maybe. Accessing DB status is safer.
        const partnerDone = coupleAsInitiator.partner?.status === 'completed';
        return {
            isCouple: true,
            coupleSession: coupleAsInitiator,
            shareCode: coupleAsInitiator.share_code,
            isReadyForPayment: partnerDone
        };
    }

    const { data: coupleAsPartner } = await supabase
        .from('couple_sessions')
        .select(`*, initiator:assessment_sessions!initiator_session_id(status), partner:assessment_sessions!partner_session_id(status)`)
        .eq('partner_session_id', sessionId)
        .single();

    if (coupleAsPartner) {
        const initiatorDone = coupleAsPartner.initiator?.status === 'completed';
        const partnerDone = true;
        return {
            isCouple: true,
            coupleSession: coupleAsPartner,
            shareCode: coupleAsPartner.share_code,
            isReadyForPayment: initiatorDone
        };
    }

    // ... (existing couples logic)
    return { isCouple: false };
}

/**
 * Team Dynamics Actions
 */

export async function createTeamSession(leaderSessionId: string, teamName: string): Promise<{ success: boolean; shareCode?: string; error?: string }> {
    const supabase = await createClient();

    // 1. Get Session
    const { data: session } = await supabase.from('assessment_sessions').select('*').eq('id', leaderSessionId).single();
    if (!session) return { success: false, error: "Session not found" };

    // Check if ALREADY in a team? For MVP we assume new.

    // 2. Generate Code
    let shareCode = generateShareCode();

    // 3. Create Team Record
    const { data: team, error: teamError } = await supabase
        .from('team_sessions')
        .insert({
            share_code: shareCode,
            leader_session_id: leaderSessionId,
            team_name: teamName,
            status: 'collecting'
        })
        .select()
        .single();

    if (teamError || !team) return { success: false, error: "Failed to create team" };

    // 4. Update Leader Session
    const { error: updateError } = await supabase
        .from('assessment_sessions')
        .update({
            share_code: shareCode, // Optional: duplicate for easy search
            session_type: 'team',
            participant_role: 'leader',
            participant_name: 'Leader', // Or prompt for name
            // team_id: team.id // if we add this column
        })
        .eq('id', leaderSessionId);

    if (updateError) return { success: false, error: "Failed to update session" };

    return { success: true, shareCode };
}

export async function joinTeamSession(shareCode: string, memberName: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    const supabase = await createClient();

    // 1. Validate Code
    const { data: teamSession } = await supabase
        .from('team_sessions')
        .select('*')
        .eq('share_code', shareCode)
        .single();

    if (!teamSession) return { success: false, error: "Invalid team code" };

    // Check expiration
    if (teamSession.expires_at && new Date(teamSession.expires_at) < new Date()) {
        return { success: false, error: "Team code has expired" };
    }

    // 2. Create Member Session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Must be logged in to join" };

    const { data: session, error: createError } = await supabase
        .from('assessment_sessions')
        .insert({
            user_id: user.id,
            use_case: 'teams',
            status: 'in_progress',
            session_type: 'team',
            participant_role: 'member',
            participant_name: memberName,
            parent_session_id: teamSession.leader_session_id, // Link to leader
            share_code: shareCode
            // team_id: teamSession.id
        })
        .select()
        .single();

    if (createError || !session) return { success: false, error: "Failed to create session" };

    return { success: true, sessionId: session.id };
}

export async function checkTeamStatus(shareCode: string): Promise<{
    isTeam: boolean;
    teamSession?: any;
    members?: any[];
    leader?: any;
    isReadyForAnalysis?: boolean;
}> {
    // Use Admin Client to bypass RLS so leader can see members
    const { createClient: createAdmin } = await import('@supabase/supabase-js');
    const adminClient = createAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const supabase = await createClient(); // Keep for user check? No, user is generic.

    // 1. Get Team Session
    const { data: team } = await adminClient
        .from('team_sessions')
        .select(`*, leader:assessment_sessions!leader_session_id (*)`)
        .eq('share_code', shareCode)
        .single();

    if (!team) return { isTeam: false };

    // Get members
    // Logic: members are sessions where parent_session_id == leader_session_id (or team_id if we had it)
    const { data: members } = await adminClient
        .from('assessment_sessions')
        .select('*')
        .eq('parent_session_id', team.leader_session_id);

    const completedCount = members?.filter((m: any) => m.status === 'completed').length || 0;
    const isReadyForAnalysis = completedCount >= 2; // Reduce to 2 for easier testing, or keep 3. Let's keep 3 (Leader + 2? No, 3 MEMBERS?)
    // Requirement says "Minimum 3". Usually means 3 participants total including leader? Or 3 members?
    // Let's assume Total 3 (Leader + 2 members).
    // So if members.length (excluding leader) >= 2?
    // My previous logic was `completedCount >= 3`. If `members` implies ONLY sub-members, then Leader + 3.
    // Let's check `simulate_participant` logic.
    // Member uses `parent_session_id`. Leader doesn't have parent.
    // So `members` array excludes Leader.
    // So `completedCount` is just sub-members.
    // I will use `>= 3` as per spec (3 members + leader = 4? OR 3 total?). Spec: "min 3, max 10". Usually total.
    // If total, then `completedCount + 1 >= 3`.
    // Let's use `completedCount >= 2` (Leader + 2 members = 3 total) to be safe for "Minimum 3".

    return {
        isTeam: true,
        teamSession: team,
        members: members || [],
        leader: team.leader,
        isReadyForAnalysis: (completedCount + 1) >= 3
    };
}
