
import { NextRequest, NextResponse } from 'next/server';

import { fetchInvoice, fetchPayment } from '@/lib/moyasar';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        // Basic validation
        if (!payload.id || !payload.type) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // We are interested in invoice.paid or payment.paid
        // Moyasar sends 'invoice.paid' usually for invoices.

        const eventType = payload.type;
        const objectId = payload.data.id;

        if (eventType !== 'invoice.paid' && eventType !== 'payment.paid') {
            // Ignore other events
            return NextResponse.json({ message: 'Ignored event type' }, { status: 200 });
        }

        console.log(`Received Moyasar webhook: ${eventType} for ${objectId}`);

        // SECURITY: Verify by fetching from Moyasar directly to ensure it's real
        // This avoids complex signature verification if we trust the fetch
        let paymentStatus = 'pending';
        let sessionId = '';
        let metadata: any = {};
        let finalAmount = 0;

        if (eventType === 'invoice.paid') {
            const invoice = await fetchInvoice(objectId);
            if (invoice.status !== 'paid') {
                console.error(`Invoice ${objectId} status mismatch: ${invoice.status}`);
                return NextResponse.json({ error: 'Status mismatch' }, { status: 400 });
            }
            paymentStatus = 'paid';
            sessionId = invoice.metadata?.session_id;
            metadata = invoice.metadata;
            finalAmount = invoice.amount;
        } else if (eventType === 'payment.paid') {
            const payment = await fetchPayment(objectId);
            if (payment.status !== 'paid') {
                console.error(`Payment ${objectId} status mismatch: ${payment.status}`);
                return NextResponse.json({ error: 'Status mismatch' }, { status: 400 });
            }
            paymentStatus = 'paid';
            // Payments might not have metadata directly if created via Invoice, 
            // but if we used createInvoice, the invoice ID is what we track.
            // If we get payment.paid, we might need to find the invoice or session from checks.
            // For now, let's assume invoice.paid is the primary trigger we care about.
        }

        if (!sessionId) {
            console.error('No session_id in metadata');
            // Try to lookup by moyasar_payment_id in our DB if needed, but we saved invoice ID as moyasar_payment_id
        }

        // Use Service Role to bypass RLS for Webhook updates
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 1. Update Payment Table
        // We use the invoice ID (which we stored in moyasar_payment_id or transaction_no)
        const { data: paymentRecord, error: findError } = await supabase
            .from('payments')
            .select('*')
            .eq('moyasar_payment_id', objectId)
            .single();

        if (findError || !paymentRecord) {
            console.error(`Payment record not found for Moyasar ID: ${objectId}`);
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        if (paymentRecord.status === 'paid') {
            return NextResponse.json({ message: 'Already processed' }, { status: 200 });
        }

        const { error: updatePaymentError } = await supabase
            .from('payments')
            .update({
                status: 'paid',
                paid_at: new Date().toISOString(),
                // could update card details here if available in payload
            })
            .eq('id', paymentRecord.id);

        if (updatePaymentError) {
            console.error("Failed to update payment:", updatePaymentError);
            return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 });
        }

        // 2. Update Session Status
        const { error: updateSessionError } = await supabase
            .from('assessment_sessions')
            .update({ payment_status: 'paid' })
            .eq('id', paymentRecord.session_id);

        if (updateSessionError) {
            console.error("Failed to update session:", updateSessionError);
            return NextResponse.json({ error: 'Session Update Failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (e: any) {
        console.error("Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
