"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Copy, Check, MessageCircle, Clock, Lock } from "lucide-react";
import { getCoupleWhatsAppLink } from "@/lib/couples";
import { PaymentModal } from "@/components/payment/PaymentModal";

interface CouplesDashboardProps {
    sessionId: string;
    shareCode: string;
    lang: string;
    isReadyForPayment: boolean; // Both finished
    isPaid: boolean;
    partnerStatus: 'waiting' | 'joined' | 'completed'; // simplified
    partnerName?: string;
}

export function CouplesDashboard({
    sessionId,
    shareCode,
    lang,
    isReadyForPayment,
    isPaid,
    partnerStatus,
    partnerName
}: CouplesDashboardProps) {
    const isAr = lang === 'ar';
    const [copied, setCopied] = useState(false);

    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://baseera.sa'}/${lang}/join/${shareCode}`;
    const whatsappLink = getCoupleWhatsAppLink(shareCode, shareUrl);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 1. If Paid -> Show nothing (Parent should render Report)
    // But for safety:
    if (isPaid) {
        return (
            <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                <h2 className="text-xl font-bold text-green-800 mb-2">
                    {isAr ? "مبروك! تم فتح التقرير" : "Report Unlocked!"}
                </h2>
                <p>{isAr ? "يمكنكم الآن الاطلاع على تحليل التوافق في الأسفل." : "You can now view your compatibility analysis below."}</p>
            </div>
        );
    }

    // 2. If Ready For Payment -> Show Pay Wall
    if (isReadyForPayment) {
        return (
            <Card className="max-w-xl mx-auto border-t-4 border-t-emerald-500 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl text-emerald-700">
                        <Lock className="w-6 h-6" />
                        {isAr ? "اكتمل التحليل!" : "Analysis Complete!"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-800 p-1 rounded-full"><Check className="w-4 h-4" /></span>
                            <span className="font-medium">{isAr ? "نتيجتك" : "Your Result"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-800 p-1 rounded-full"><Check className="w-4 h-4" /></span>
                            <span className="font-medium">{isAr ? "نتيجة الشريك" : "Partner's Result"}</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                            {isAr
                                ? "نتائجكما جاهزة! افتح التقرير الكامل الآن لتعرف مدى توافقكما."
                                : "Both results are ready! Unlock the full report to discover your compatibility."}
                        </p>

                        <PaymentModal
                            sessionId={sessionId}
                            lang={lang}
                            price={20} // Override price for Couples
                            title={isAr ? "فتح تقرير توافق الأزواج" : "Unlock Couples Report"}
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // 3. Waiting for Partner (Share Code)
    return (
        <Card className="max-w-2xl mx-auto border-0 shadow-2xl bg-white overflow-hidden">
            <div className="h-3 w-full bg-gradient-to-r from-brand-indigo to-brand-purple"></div>
            <CardHeader className="text-center pt-8 pb-4">
                <div className="mx-auto bg-brand-indigo/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-brand-indigo" />
                </div>
                <CardTitle className={`text-3xl font-bold text-slate-900 ${isAr ? 'font-tajawal' : 'font-inter'}`}>
                    {isAr ? "دعوة الشريك" : "Invite Partner"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-10">
                <div className="text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-indigo/30 transition-colors group">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        {isAr ? "رمز المشاركة" : "Share Code"}
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-5xl font-mono font-bold tracking-widest text-slate-900 group-hover:text-brand-indigo transition-colors">{shareCode}</span>
                        <Button variant="ghost" size="icon" onClick={copyToClipboard} className="hover:bg-brand-indigo/10 h-10 w-10">
                            {copied ? <Check className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6 text-slate-400 group-hover:text-brand-indigo" />}
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-center text-slate-500">
                        {isAr ? "شارك هذا الرمز مع شريكك للبدء." : "Share this code with your partner to start."}
                    </p>
                    <Button asChild className="w-full h-14 text-lg font-bold bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 shadow-lg shadow-green-500/20 rounded-xl">
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-6 h-6" />
                            {isAr ? "إرسال عبر واتساب" : "Send via WhatsApp"}
                        </a>
                    </Button>
                </div>

                <div className="flex items-center justify-center gap-3 text-amber-700 bg-amber-50 p-4 rounded-xl text-sm font-medium border border-amber-100">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </div>
                    <span>
                        {isAr
                            ? `في انتظار ${partnerName || "الشريك"} لإكمال التحليل...`
                            : `Waiting for ${partnerName || "partner"} to complete...`}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="justify-center border-t border-slate-50 p-6 bg-slate-50/50">
                <p className="text-sm text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {isAr ? "سنعلمك فور اكتمال الطرف الآخر" : "We'll notify you once they complete it"}
                </p>
            </CardFooter>
        </Card>
    );
}
