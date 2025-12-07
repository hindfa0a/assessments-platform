"use client";

import { useState, useEffect } from "react";
import { PaymentModal } from "@/components/payment/PaymentModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, RefreshCw } from "lucide-react";
import { verifyPayment } from "@/lib/supabase/actions";
import { useRouter } from "next/navigation";


interface ResultsContainerProps {
    status: string; // 'paid' | 'pending' | ...
    sessionId: string;
    lang: string;
    children: React.ReactNode;
    useCaseName: string;
    price: number;
    actionsDisabled?: boolean;
    actionsDisabledMessage?: string;
}

export function ResultsContainer({ status, sessionId, lang, children, useCaseName, price, actionsDisabled, actionsDisabledMessage }: ResultsContainerProps) {
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const router = useRouter();
    const isPaid = status === 'paid';
    const isAr = lang === 'ar';

    // Auto-check on mount if pending
    useEffect(() => {
        if (!isPaid) {
            handleVerify();
        }
    }, [isPaid]); // Run on mount if pending

    const handleVerify = async () => {
        setVerifying(true);
        // Call server action to check status against Moyasar
        const result = await verifyPayment(sessionId);
        if (result.success) {
            router.refresh();
            // Success state will be handled by page reload showing content
        } else {
            setVerifying(false);
            // Don't alert on auto-check, only if manual? 
            // Actually, verifyPayment checks DB or Moyasar.
            // If it returns success, it updated DB. Good.
        }
    };

    return (
        <div className="relative">
            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentOpen}
                sessionId={sessionId}
                price={price}
                useCaseName={useCaseName}
                lang={lang}
            />

            {/* Content with Blur if Not Paid */}
            <div className={`transition-all duration-500 ${!isPaid ? 'filter blur-md select-none pointer-events-none' : ''}`}>
                {children}
            </div>

            {/* Lock Overlay */}
            {!isPaid && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
                    <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 backdrop-blur-xl ring-1 ring-black/5">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto bg-gradient-to-br from-brand-indigo/10 to-brand-purple/10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <Lock className="w-10 h-10 text-brand-indigo" />
                            </div>
                            <CardTitle className={`text-3xl font-bold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent ${isAr ? 'font-tajawal' : 'font-inter'}`}>
                                {isAr ? "التقرير الكامل مقفل" : "Full Report Locked"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-8 px-8 pb-10">
                            <p className="text-lg text-slate-600 leading-relaxed">
                                {isAr
                                    ? "لقد أكملت التقييم بنجاح! اكتشف تحليلك الشخصي المفصل وتوصيات الذكاء الاصطناعي الآن."
                                    : "You've completed the assessment! Discover your detailed personal analysis and AI recommendations now."}
                            </p>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <span className="block text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">{isAr ? "سعر التقرير" : "Report Price"}</span>
                                <p className="font-extrabold text-4xl text-slate-900">
                                    {price} <span className="text-xl text-slate-500 font-medium">{isAr ? "ر.س" : "SAR"}</span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                {actionsDisabled ? (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-center font-medium flex items-center justify-center gap-2">
                                        <Lock className="w-5 h-5 text-amber-600" />
                                        {actionsDisabledMessage || (isAr ? "الإجراءات معطلة حالياً" : "Actions currently disabled")}
                                    </div>
                                ) : (
                                    <Button
                                        size="lg"
                                        className="w-full font-bold text-lg h-14 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 transition-all shadow-lg shadow-brand-indigo/25 hover:shadow-brand-indigo/40 hover:scale-[1.02]"
                                        onClick={() => setIsPaymentOpen(true)}
                                    >
                                        {isAr ? "فتح التقرير الآن" : "Unlock Report Now"}
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-brand-indigo hover:bg-transparent transition-colors"
                                    onClick={handleVerify}
                                    disabled={verifying}
                                >
                                    {verifying ? (
                                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                    ) : (
                                        <RefreshCw className="w-3 h-3 mr-2" />
                                    )}
                                    {isAr ? "هل دفعت بالفعل؟ تحديث الحالة" : "Already paid? Refresh Status"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
