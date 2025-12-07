"use client";

import { useState } from "react";
import { useAssessment } from "@/hooks/use-assessment";
import { ToolId, UserAnswer } from "@/lib/assessments/types";
import { QuestionCard } from "./QuestionCard";
import { Progress } from "@/components/ui/progress";

interface AssessmentRunnerProps {
    toolId: ToolId;
    lang: string;
    onComplete: (answers: UserAnswer[]) => void;
}

export function AssessmentRunner({ toolId, lang, onComplete }: AssessmentRunnerProps) {
    const {
        currentQuestion,
        currentIndex,
        totalQuestions,
        progress,
        submitAnswer,
        isComplete
    } = useAssessment({
        toolId,
        onComplete
    });

    if (isComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-brand-indigo border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">{lang === 'ar' ? 'جاري حساب النتائج...' : 'Calculating Results...'}</h3>
                    <p className="text-slate-500">{lang === 'ar' ? 'يرجى الانتظار قليلاً' : 'Please wait a moment'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-3xl mx-auto">
            <div className="space-y-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between text-sm font-medium text-slate-600 px-1">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-indigo"></span>
                        {lang === 'ar' ? `السؤال ${currentIndex + 1} من ${totalQuestions}` : `Question ${currentIndex + 1} of ${totalQuestions}`}
                    </span>
                    <span className="text-brand-indigo">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-brand-indigo [&>div]:to-brand-purple rounded-full" />
            </div>

            <QuestionCard
                question={currentQuestion}
                lang={lang}
                onAnswer={submitAnswer}
            />
        </div>
    );
}
