import { useState, useCallback, useRef } from 'react';
import { Question, UserAnswer, ToolId } from '@/lib/assessments/types';
import { QUESTIONS } from '@/lib/assessments/data';

interface UseAssessmentProps {
    toolId: ToolId;
    onComplete: (answers: UserAnswer[]) => void;
}

export function useAssessment({ toolId, onComplete }: UseAssessmentProps) {
    // Filter questions for this tool
    const questions = QUESTIONS.filter(q => q.toolId === toolId);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<UserAnswer[]>([]);
    const [startTime, setStartTime] = useState<number>(Date.now());

    const submitAnswer = useCallback((value: number) => {
        const now = Date.now();
        const timeTaken = now - startTime;

        // Create answer object
        const answer: UserAnswer = {
            questionId: questions[currentIndex].id,
            value: value,
            responseTimeMs: timeTaken,
            timestamp: now
        };

        setAnswers(prev => [...prev, answer]);

        // Move to next or complete
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setStartTime(Date.now()); // Reset timer for next question
        } else {
            // Finished
            const finalAnswers = [...answers, answer];
            onComplete(finalAnswers);
        }
    }, [currentIndex, questions, answers, startTime, onComplete]);

    const progress = ((currentIndex) / questions.length) * 100;

    return {
        currentQuestion: questions[currentIndex],
        currentIndex,
        totalQuestions: questions.length,
        progress,
        submitAnswer,
        isComplete: currentIndex >= questions.length, // Logic needs refinement if we want to show a completion screen *after* last answer
    };
}
