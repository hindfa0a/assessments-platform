
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { getSystemPrompt } from '@/lib/ai/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const { sessionId, lang } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // Use Service Role to bypass RLS (Crucial for AI to read data if user context is weak/missing)
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Fetch Session Data
        const { data: session, error } = await supabase
            .from('assessment_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (error || !session) {
            console.error("AI Fetch Error:", error);
            return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 });
        }

        // 2. Verify Payment (Skip for demo/admin if needed, but enforce for now)
        if (session.payment_status !== 'paid' && session.payment_status !== 'unpaid_demo') {
            // Allow 'unpaid_demo' or strictly check 'paid'. 
            // For dev/test, we might want to bypass if we manualy set status.
            return NextResponse.json({ error: 'Payment required for analysis' }, { status: 403 });
        }

        // 3. Prepare Context from Results
        // We assume results are stored in columns like mbti_type, holland_code, etc.
        // 3. Prepare Context from Results
        // We assume results are stored in columns like mbti_type, holland_code, etc.
        const resultsContext = {
            mbti: { type: session.mbti_type, scores: session.mbti_scores },
            holland: { code: session.holland_code, scores: session.holland_scores },
            big_five: { scores: session.big_five_scores },
            work_values: { scores: session.work_values_scores },
            attachment: { style: session.attachment_style, scores: session.attachment_scores },
            love_languages: { scores: session.love_languages_scores },
            strengths: { scores: session.strengths_scores },
            eq: { scores: session.eq_scores },
            conflict: { style: session.conflict_style, scores: session.conflict_scores },
        };


        const systemPrompt = getSystemPrompt(session.use_case || 'major_selection', lang || 'ar');

        // Dynamically build user message based on available data
        let resultsText = "";
        if (resultsContext.mbti.type || resultsContext.mbti.scores) resultsText += `MBTI: ${JSON.stringify(resultsContext.mbti)}\n`;
        if (resultsContext.holland.code || resultsContext.holland.scores) resultsText += `Holland Code: ${JSON.stringify(resultsContext.holland)}\n`;
        if (resultsContext.big_five.scores) resultsText += `Big Five: ${JSON.stringify(resultsContext.big_five)}\n`;
        if (resultsContext.work_values.scores) resultsText += `Work Values: ${JSON.stringify(resultsContext.work_values)}\n`;
        if (resultsContext.attachment.style) resultsText += `Attachment Style: ${JSON.stringify(resultsContext.attachment)}\n`;
        if (resultsContext.strengths.scores) resultsText += `Strengths: ${JSON.stringify(resultsContext.strengths)}\n`;
        if (resultsContext.eq.scores) resultsText += `Emotional Intelligence: ${JSON.stringify(resultsContext.eq)}\n`;
        if (resultsContext.conflict.style) resultsText += `Conflict Style: ${JSON.stringify(resultsContext.conflict)}\n`;

        const userMessage = `
        نتائج العميل/الطالب:
        ${resultsText}
        
        يرجى تقديم التحليل والتوصيات بناءً على هذه النتائج.
        `;

        // 4. Call OpenAI API (Streaming)
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            stream: true,
            temperature: 0.7,
        });

        // 5. Create ReadableStream
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(new TextEncoder().encode(content));
                    }
                }
                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (e: any) {
        console.error("AI Analysis Error:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
