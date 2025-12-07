"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users } from "lucide-react";

interface CouplesReportProps {
    sessionId: string;
    lang: string;
    initiatorResults?: any;
    partnerResults?: any;
}

export function CouplesReport({ sessionId, lang, initiatorResults, partnerResults }: CouplesReportProps) {
    const isAr = lang === 'ar';

    return (
        <Card className="mt-8 border-0 shadow-xl bg-white overflow-hidden rounded-2xl">
            <div className="h-2 w-full bg-gradient-to-r from-pink-500 to-rose-500"></div>
            <CardHeader className="pb-2 pt-8 px-8">
                <CardTitle className={`flex items-center gap-3 text-2xl font-bold text-pink-600 ${isAr ? 'font-tajawal' : 'font-inter'}`}>
                    <div className="bg-pink-100 p-2 rounded-lg">
                        <Heart className="w-6 h-6 text-pink-600 animate-pulse" />
                    </div>
                    {isAr ? "تقرير توافق الأزواج" : "Couples Compatibility Report"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-lg transition-shadow">
                        <h3 className="font-bold text-xl mb-3 text-slate-800">{isAr ? "أنت" : "You"}</h3>
                        <p className="text-pink-600 font-medium text-lg">Attached / Secure</p>
                    </div>
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-lg transition-shadow">
                        <h3 className="font-bold text-xl mb-3 text-slate-800">{isAr ? "الشريك" : "Partner"}</h3>
                        <p className="text-pink-600 font-medium text-lg">Anxious / Preoccupied</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50/50 to-white p-8 rounded-2xl border border-pink-100 shadow-sm">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-pink-700">
                        <Users className="w-5 h-5" />
                        {isAr ? "تحليل التوافق (AI)" : "AI Compatibility Analysis"}
                    </h3>
                    <p className="text-slate-600 leading-loose text-lg">
                        {isAr
                            ? "بناءً على نتائجكما، يظهر أن هناك تكاملاً قوياً بين نمط التعلق الخاص بك وشريكك. ينصح بالتركيز على التواصل المفتوح لتعزيز الثقة."
                            : "Based on your results, there is a strong complementarity between your attachment style and your partner's. Open communication is recommended to build trust."
                        }
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
