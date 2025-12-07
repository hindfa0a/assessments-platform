"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface AIAnalysisReportProps {
    sessionId: string;
    lang: string;
    isPaid: boolean;
}

export function AIAnalysisReport({ sessionId, lang, isPaid }: AIAnalysisReportProps) {
    const [analysis, setAnalysis] = useState("");
    const [loading, setLoading] = useState(false);
    const [started, setStarted] = useState(false);
    const [error, setError] = useState("");
    const contentRef = useRef<HTMLDivElement>(null);

    const isAr = lang === 'ar';

    const startAnalysis = async () => {
        setLoading(true);
        setStarted(true);
        setError("");
        setAnalysis("");

        try {
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, lang })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Analysis failed");
            }

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                accumulatedText += chunk;
                setAnalysis(accumulatedText);

                // Auto-scroll
                if (contentRef.current) {
                    contentRef.current.scrollTop = contentRef.current.scrollHeight;
                }
            }

        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isPaid) return null;

    return (
        <Card className="mt-8 border-0 shadow-xl bg-white overflow-hidden rounded-2xl">
            <div className="h-2 w-full bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan animate-gradient-x"></div>
            <CardHeader className="pb-2 pt-8 px-8">
                <CardTitle className={`flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent ${isAr ? 'font-tajawal' : 'font-inter'}`}>
                    <div className="bg-brand-indigo/10 p-2 rounded-lg">
                        <Sparkles className="w-6 h-6 text-brand-indigo animate-pulse" />
                    </div>
                    {isAr ? "تحليل الذكاء الاصطناعي (Baseera AI)" : "AI Analysis (Baseera AI)"}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-10">
                {!started ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-slate-100 mt-4">
                        <p className={`text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed ${isAr ? 'font-tajawal' : 'font-inter'}`}>
                            {isAr
                                ? "احصل على تقرير مفصل يربط بين نمط شخصيتك، ميولك المهنية، ورؤية المملكة 2030."
                                : "Get a detailed report connecting your personality, career interests, and Saudi Vision 2030."}
                        </p>
                        <Button
                            onClick={startAnalysis}
                            size="lg"
                            className="gap-3 h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 shadow-lg shadow-brand-indigo/20 transition-all hover:scale-105"
                        >
                            <Sparkles className="w-5 h-5" />
                            {isAr ? "ابدأ التحليل الآن" : "Start Analysis Now"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 mt-4">
                        {error ? (
                            <div className="text-red-600 p-6 bg-red-50 rounded-xl text-center border border-red-100">
                                <p className="font-medium mb-4">{error}</p>
                                <Button variant="outline" onClick={startAnalysis} className="mx-auto block hover:bg-red-50 hover:text-red-700 hover:border-red-200">
                                    {isAr ? "إعادة المحاولة" : "Retry"}
                                </Button>
                            </div>
                        ) : (
                            <div
                                className={`prose max-w-none p-8 bg-slate-50 rounded-2xl border border-slate-100 min-h-[300px] 
                                    ${isAr ? 'prose-p:text-right prose-headings:text-right font-tajawal' : 'font-inter'}
                                    prose-headings:text-brand-indigo prose-strong:text-brand-purple prose-a:text-blue-600
                                    prose-li:marker:text-brand-indigo/50`}
                                dir={isAr ? "rtl" : "ltr"}
                                ref={contentRef}
                            >
                                <ReactMarkdown>{analysis}</ReactMarkdown>
                                {loading && (
                                    <div className="flex items-center gap-3 text-brand-indigo mt-6 animate-pulse font-medium">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>{isAr ? "جاري كتابة التقرير..." : "Generating report..."}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
