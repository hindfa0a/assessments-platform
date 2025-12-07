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

    const getStyle = (results: any) => {
        if (!results) return isAr ? "بانتظار النتائج..." : "Waiting for results...";
        const style = results.attachment_style || "Unknown";

        const STYLE_MAP: Record<string, { ar: string, en: string }> = {
            'SECURE': { ar: 'آمن', en: 'Secure' },
            'ANXIOUS': { ar: 'قلق', en: 'Anxious' },
            'AVOIDANT': { ar: 'تجنبي', en: 'Avoidant' },
            'FEARFUL': { ar: 'خائف', en: 'Fearful' }
        };
        return isAr ? (STYLE_MAP[style]?.ar || style) : (STYLE_MAP[style]?.en || style);
    };

    const getTopLoveLanguage = (results: any) => {
        if (!results || !results.love_languages_scores) return "";
        const scores = results.love_languages_scores;
        const top = Object.entries(scores).sort(([, a], [, b]) => (b as number) - (a as number))[0];
        if (!top) return "";

        const LANG_MAP: Record<string, { ar: string, en: string }> = {
            'WORDS': { ar: 'كلمات التوكيد', en: 'Words of Affirmation' },
            'TIME': { ar: 'تخصيص الوقت', en: 'Quality Time' },
            'GIFTS': { ar: 'تلقي الهدايا', en: 'Receiving Gifts' },
            'ACTS': { ar: 'أعمال الخدمة', en: 'Acts of Service' },
            'TOUCH': { ar: 'التلامس الجسدي', en: 'Physical Touch' }
        };
        const key = top[0];
        return isAr ? (LANG_MAP[key]?.ar || key) : (LANG_MAP[key]?.en || key);
    };

    const myStyle = getStyle(initiatorResults);
    const partnerStyle = getStyle(partnerResults);
    const myLang = getTopLoveLanguage(initiatorResults);
    const partnerLang = getTopLoveLanguage(partnerResults);

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
                        <div className="space-y-2">
                            <p className="text-pink-600 font-bold text-lg">{myStyle}</p>
                            {myLang && <p className="text-sm text-muted-foreground">{isAr ? "لغة الحب:" : "Love Language:"} {myLang}</p>}
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-lg transition-shadow">
                        <h3 className="font-bold text-xl mb-3 text-slate-800">{isAr ? "الشريك" : "Partner"}</h3>
                        {partnerResults ? (
                            <div className="space-y-2">
                                <p className="text-pink-600 font-bold text-lg">{partnerStyle}</p>
                                {partnerLang && <p className="text-sm text-muted-foreground">{isAr ? "لغة الحب:" : "Love Language:"} {partnerLang}</p>}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">{isAr ? "في انتظار الشريك..." : "Waiting for partner..."}</p>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50/50 to-white p-8 rounded-2xl border border-pink-100 shadow-sm">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-pink-700">
                        <Users className="w-5 h-5" />
                        {isAr ? "تحليل التوافق (AI)" : "AI Compatibility Analysis"}
                    </h3>
                    <p className="text-slate-600 leading-loose text-lg">
                        {isAr
                            ? "بناءً على نتائجكما، سيقوم النظام بتحليل التوافق بين نمط التعلق ولغات الحب لتقديم توصيات مخصصة لتقوية العلاقة."
                            : "Based on your results, the system will analyze the compatibility between your attachment styles and love languages to provide personalized recommendations for strengthening the relationship."
                        }
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
