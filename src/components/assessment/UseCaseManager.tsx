"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UseCaseConfig, UserAnswer } from "@/lib/assessments/types";
import { AssessmentRunner } from "./AssessmentRunner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { saveAssessmentSession } from "@/lib/supabase/actions";
import { calculateMBTI } from "@/lib/assessments/scoring/mbti";
import { calculateHolland } from "@/lib/assessments/scoring/holland";
import { calculateBigFive } from "@/lib/assessments/scoring/big-five";
import { calculateWorkValues } from "@/lib/assessments/scoring/work-values";
import { calculateAttachment } from "@/lib/assessments/scoring/attachment";
import { calculateLoveLanguages } from "@/lib/assessments/scoring/love-languages";
import { calculateStrengths } from "@/lib/assessments/scoring/strengths";
import { calculateEQ } from "@/lib/assessments/scoring/eq";
import { calculateConflictStyle } from "@/lib/assessments/scoring/conflict";

interface UseCaseManagerProps {
    useCase: UseCaseConfig;
    lang: string;
    sessionId?: string;
}

export function UseCaseManager({ useCase, lang, sessionId }: UseCaseManagerProps) {
    const [currentToolIndex, setCurrentToolIndex] = useState(0);
    const [allAnswers, setAllAnswers] = useState<Record<string, UserAnswer[]>>({});
    const [isFinished, setIsFinished] = useState(false);
    const router = useRouter();

    const currentToolId = useCase.tools[currentToolIndex];
    const isAr = lang === "ar";

    const handleToolComplete = (answers: UserAnswer[]) => {
        const updatedAnswers = { ...allAnswers, [currentToolId]: answers };
        setAllAnswers(updatedAnswers);

        if (currentToolIndex < useCase.tools.length - 1) {
            setCurrentToolIndex(prev => prev + 1);
        } else {
            handleAllComplete(updatedAnswers);
        }
    };

    const handleAllComplete = async (answers: Record<string, UserAnswer[]>) => {
        setIsFinished(true);

        // 1. Calculate Results Client-Side
        const resultsToSave: any = {};

        // Helper to flatten answers for a specific tool if needed, 
        // but our scorers usually take an array. 
        // Our 'answers' record is keyed by tool ID? 
        // No, in handleToolComplete we use `currentToolId` which is e.g. 'mbti', 'holland'.
        // So `answers` is { 'mbti': [...], 'holland': [...] }

        if (answers['mbti']) {
            const mbtiResult = calculateMBTI(answers['mbti']);
            resultsToSave.mbti_type = mbtiResult.label;
            resultsToSave.mbti_scores = mbtiResult.scores;
        }

        if (answers['holland']) {
            const hollandResult = calculateHolland(answers['holland']);
            resultsToSave.holland_code = hollandResult.label;
            resultsToSave.holland_scores = hollandResult.scores;
        }

        // Add others as needed (big_five, etc.)
        if (answers['big_five']) {
            const res = calculateBigFive(answers['big_five']);
            resultsToSave.big_five_scores = res.scores;
        }

        if (answers['work_values']) {
            const res = calculateWorkValues(answers['work_values']);
            resultsToSave.work_values_scores = res.scores;
        }

        if (answers['attachment']) {
            const res = calculateAttachment(answers['attachment']);
            resultsToSave.attachment_style = res.label;
            resultsToSave.attachment_scores = res.scores;
        }

        if (answers['love_languages']) {
            const res = calculateLoveLanguages(answers['love_languages']);
            resultsToSave.love_languages_scores = res.scores;
        }

        if (answers['strengths']) {
            const res = calculateStrengths(answers['strengths']);
            resultsToSave.strengths_scores = res.scores;
        }

        if (answers['eq']) {
            const res = calculateEQ(answers['eq']);
            resultsToSave.eq_scores = res.scores;
        }

        if (answers['conflict']) {
            const res = calculateConflictStyle(answers['conflict']);
            resultsToSave.conflict_style = res.label;
            resultsToSave.conflict_scores = res.scores;
        }

        // Save to Real DB
        try {
            // Pass existing sessionId if available (Join Flow)
            // Pass the calculated results as the 4th argument
            const result = await saveAssessmentSession(useCase.id, answers, sessionId, resultsToSave);

            if (!result.success) {
                console.error("Save failed:", result.error);
                // In real app: Show toast error
            } else {
                console.log("Saved to DB, Session ID:", result.sessionId);
            }

            // Redirect to results using the REAL session ID if available, else demo
            const targetSessionId = result.sessionId || 'demo-session';
            router.push(`/${lang}/results/${targetSessionId}`);
        } catch (e) {
            console.error("Critical save error", e);
            router.push(`/${lang}/results/demo-session`);
        }
    };

    if (isFinished) {
        return (
            <Card className="max-w-md mx-auto mt-12 text-center p-8">
                <h2 className="text-2xl font-bold mb-4">{isAr ? "تم إكمال التقييم!" : "Assessment Complete!"}</h2>
                <p className="text-muted-foreground mb-6">
                    {isAr ? "جاري تحليل نتائجك..." : "Analyzing your results..."}
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </Card>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-center mb-2">
                    {isAr ? useCase.nameAr : useCase.nameEn}
                </h1>
                <p className="text-center text-muted-foreground">
                    {isAr ? `الأداة الحالية: ${currentToolId}` : `Current Tool: ${currentToolId}`}
                </p>
            </div>

            <AssessmentRunner
                key={currentToolId} // Re-mount on tool change
                toolId={currentToolId}
                lang={lang}
                onComplete={handleToolComplete}
            />
        </div>
    );
}
