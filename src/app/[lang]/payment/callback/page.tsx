import { checkPaymentStatus, verifyPayment } from "@/lib/supabase/actions";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Force dynamic rendering as we use searchParams
export const dynamic = 'force-dynamic';

export default async function PaymentCallbackPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ status: string; id: string; message?: string; sessionId?: string }>;
}) {
    // Await params and searchParams for Next.js 15 compatibility
    const { lang } = await params;
    const { status, id, message, sessionId } = await searchParams; // Now capturing sessionId
    // id is the Moyasar Invoice ID

    const isAr = lang === 'ar';
    const isPaid = status === 'paid';

    // SERVER-SIDE VERIFICATION:
    // If we have sessionId and status is paid, force a sync with Moyasar
    // This handles the Localhost case where Webhooks don't fire.
    if (isPaid && sessionId && id) {
        await verifyPayment(sessionId, id);
    }
    const isFailed = status === 'failed';

    // We might want to link the payment id to session from DB, 
    // but the session_id is not in the URL unless we added it or look it up via payment ID.
    // The webhook handler updates the DB.
    // For the UI, we should probably redirect the user back to the results page or a "Processing" page.

    // PROBLEM: We don't have sessionId here readily unless we passed it in URL?
    // Moyasar allows metadata, but redirect URL is static?
    // Actually, when we created the invoice, we set `callback_url`.
    // We could have set `callback_url?sessionId=...`! 

    // Oh wait, I set `callbackUrl` in `PaymentModal` as `${protocol}//${host}/${lang}/payment/callback`.
    // I should have appended `?sessionId=${sessionId}`!

    // Let's assume for now I will fix PaymentModal to pass sessionId.
    // But since I can't change the previous tool output easily without a new write, 
    // I will modify this file to handle `sessionId` if present, 
    // AND I will modify the PaymentModal to include it.

    // If sessionId is missing, we are stuck. 

    // Let's stub this page first, then fix PaymentModal.

    // Verify valid status/id if needed, but for UI redirection we trust the params. 
    // The Results Page will do the hard verification against the DB.

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-6">
            {isPaid ? (
                <>
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold">{isAr ? "تم الدفع بنجاح!" : "Payment Successful!"}</h1>
                    <p className="text-muted-foreground max-w-md">
                        {isAr
                            ? "تم استلام دفعتك. يمكنك الآن الاطلاع على النتائج."
                            : "Payment received. You can now view your results."}
                    </p>

                    {sessionId ? (
                        <Link
                            href={`/${lang}/results/${sessionId}`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2"
                        >
                            {isAr ? "عرض النتائج" : "View Results"}
                        </Link>
                    ) : (
                        <p className="text-sm text-yellow-600 mt-4">
                            {isAr ? "رقم الجلسة مفقود. يرجى العودة للصفحة الرئيسية." : "Session ID missing. Please return home."}
                        </p>
                    )}

                    <Link href={`/${lang}`} className="text-sm text-muted-foreground underline mt-4">
                        {isAr ? "العودة للرئيسية" : "Return Home"}
                    </Link>
                </>
            ) : (
                <>
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <XCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold">{isAr ? "فشلت عملية الدفع" : "Payment Failed"}</h1>
                    <p className="text-muted-foreground">{message || (isAr ? "حدث خطأ ما." : "Something went wrong.")}</p>

                    {sessionId && (
                        <Link
                            href={`/${lang}/results/${sessionId}`}
                            className="btn btn-outline mt-4"
                        >
                            {isAr ? "العودة للنتائج" : "Return to Results"}
                        </Link>
                    )}
                </>
            )}
        </div>
    );
}
