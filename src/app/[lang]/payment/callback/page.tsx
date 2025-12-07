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
    if (isPaid && sessionId && id) {
        await verifyPayment(sessionId, id);
        // CRITICAL UX FIX: Auto-redirect to results
        redirect(`/${lang}/results/${sessionId}`);
    }

    // ... existing error handling ...

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-6">
            {/* If we are here, it means it's NOT paid or verification failed/pending */}
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">{isAr ? "فشلت عملية الدفع" : "Payment Failed"}</h1>
            <p className="text-muted-foreground">{message || (isAr ? "حدث خطأ ما." : "Something went wrong.")}</p>

            {sessionId && (
                <Link
                    href={`/${lang}/results/${sessionId}`}
                    className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                    {isAr ? "العودة للنتائج" : "Return to Results"}
                </Link>
            )}
        </div>
    );
}
