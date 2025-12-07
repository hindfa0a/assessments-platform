"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { initiateAssessmentPayment } from "@/lib/supabase/actions";
import { useRouter } from "next/navigation";

interface PaymentModalProps {
    isOpen?: boolean; // Optional now
    sessionId: string;
    price?: number; // Optional override
    useCaseName?: string; // Optional if title provided
    lang: string;
    title?: string; // Override title
}

export function PaymentModal({ isOpen = false, sessionId, price = 10, useCaseName = "Assessment", lang, title }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleUnlock = async () => {
        setLoading(true);
        setError("");

        // Construct callback URL
        const protocol = window.location.protocol;
        const host = window.location.host;
        const callbackUrl = `${protocol}//${host}/${lang}/payment/callback?sessionId=${sessionId}`;

        try {
            const result = await initiateAssessmentPayment(sessionId, callbackUrl);

            if (result.success && result.paymentUrl) {
                // Redirect to Moyasar
                window.location.href = result.paymentUrl;
            } else {
                setError(result.error || "Payment initialization failed");
                setLoading(false);
            }
        } catch (e) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    const isAr = lang === 'ar';

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            {/* If we want to use a trigger from outside, we can, but here we enforce open via prop if needed 
                OR we can default to closed and use a trigger.
                The previous implementation assumed it was controlled from outside. 
                Let's keep it controlled or add a trigger if we want to use it as a button.
                
                Actually, let's Stick to the prompt: User clicks 'Unlock'.
                So we can just render the Button in the page, and when clicked it opens the modal.
                So `isOpen` prop is fine if controlled by a parent Client Component.
                
                But ResultsPage is Server. So we need a Client wrapper for the Page content?
                Or just a "ResultsView" client component.
            */}
            <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-2xl" dir={isAr ? "rtl" : "ltr"}>
                <DialogHeader className="pt-6">
                    <div className="mx-auto bg-brand-indigo/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-brand-indigo" />
                    </div>
                    <DialogTitle className={`text-center text-2xl font-bold text-slate-900 ${isAr ? 'font-tajawal' : 'font-inter'}`}>
                        {title || (isAr ? "فتح التقرير الكامل" : "Unlock Full Report")}
                    </DialogTitle>
                    <DialogDescription className="text-center space-y-2 pt-2 text-slate-500">
                        <span className="block">
                            {isAr
                                ? `لقد أكملت تقييم ${useCaseName} بنجاح!`
                                : `You have successfully completed the ${useCaseName} assessment!`}
                        </span>
                        <span className="block">
                            {isAr
                                ? "للحصول على التقرير التفصيلي والتحليل بالذكاء الاصطناعي، يرجى إتمام عملية الدفع."
                                : "To access your detailed report and AI analysis, please complete the payment."}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-6 px-4">
                    <div className="flex justify-between items-center p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-medium text-slate-600">{isAr ? "السعر الإجمالي" : "Total Price"}</span>
                        <span className="text-2xl font-bold text-brand-indigo">{price} {isAr ? "ر.س" : "SAR"}</span>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>
                    )}
                </div>

                <DialogFooter className="sm:justify-center pb-6 px-4">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto min-w-[200px] h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 shadow-lg shadow-brand-indigo/20"
                        onClick={handleUnlock}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isAr ? `ادفع ${price} ر.س وافتح التقرير` : `Pay ${price} SAR & Unlock`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
