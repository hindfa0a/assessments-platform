import { UserAnswer, AssessmentResult } from '../types';
import { QUESTIONS } from '../data';

export const ATTACHMENT_STYLES: Record<string, { nameAr: string; nameEn: string }> = {
    'SECURE': { nameAr: 'آمن', nameEn: 'Secure' },
    'ANXIOUS': { nameAr: 'متعلق', nameEn: 'Anxious' },
    'AVOIDANT': { nameAr: 'مستقل', nameEn: 'Avoidant' },
    'FEARFUL': { nameAr: 'حذر', nameEn: 'Fearful-Avoidant' }
};

export function calculateAttachment(answers: UserAnswer[]): AssessmentResult {
    const scores: Record<string, number> = {
        'SECURE': 0, 'ANXIOUS': 0, 'AVOIDANT': 0, 'FEARFUL': 0
    };

    answers.forEach(ans => {
        const question = QUESTIONS.find(q => q.id === ans.questionId);
        if (!question || question.toolId !== 'attachment') return;

        scores[question.dimension] += ans.value;
    });

    // Find max
    const maxStyle = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return {
        toolId: 'attachment',
        scores,
        label: maxStyle,
        details: {
            style: ATTACHMENT_STYLES[maxStyle]
        }
    };
}
