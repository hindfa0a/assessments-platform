"use client";

import { motion } from "framer-motion";
import { Question } from "@/lib/assessments/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
    question: Question;
    lang: string;
    onAnswer: (value: number) => void;
    isSubmitting?: boolean;
}

const VARIANTS = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

const OPTIONS = [
    { value: 2, labelAr: "أوافق بشدة", labelEn: "Strongly Agree", color: "bg-emerald-500 hover:bg-emerald-600 border-emerald-600 shadow-emerald-500/20" },
    { value: 1, labelAr: "أوافق", labelEn: "Agree", color: "bg-emerald-400 hover:bg-emerald-500 border-emerald-500 shadow-emerald-400/20" },
    { value: 0, labelAr: "محايد", labelEn: "Neutral", color: "bg-slate-300 hover:bg-slate-400 border-slate-400 shadow-slate-300/20 text-slate-700" },
    { value: -1, labelAr: "لا أوافق", labelEn: "Disagree", color: "bg-rose-400 hover:bg-rose-500 border-rose-500 shadow-rose-400/20" },
    { value: -2, labelAr: "لا أوافق بشدة", labelEn: "Strongly Disagree", color: "bg-rose-500 hover:bg-rose-600 border-rose-600 shadow-rose-500/20" },
];

export function QuestionCard({ question, lang, onAnswer, isSubmitting }: QuestionCardProps) {
    const isAr = lang === "ar";

    return (
        <motion.div
            key={question.id}
            variants={VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl mx-auto"
        >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden rounded-2xl">
                <CardContent className="p-8 md:p-12 flex flex-col items-center text-center space-y-10">
                    <h2 className={`text-2xl md:text-4xl font-bold leading-relaxed text-slate-800 ${isAr ? 'font-tajawal' : 'font-inter'}`}>
                        {isAr ? question.textAr : question.textEn}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
                        {OPTIONS.map((opt) => (
                            <Button
                                key={opt.value}
                                onClick={() => onAnswer(opt.value)}
                                disabled={isSubmitting}
                                className={cn(
                                    "h-16 text-lg font-medium transition-all transform hover:scale-105 shadow-md border-b-4 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed",
                                    opt.color,
                                    opt.value === 0 ? "text-slate-700" : "text-white"
                                )}
                            >
                                {isAr ? opt.labelAr : opt.labelEn}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
