import { UserAnswer, AssessmentResult } from '../types';
import { QUESTIONS } from '../data';

export const CONFLICT_STYLES: Record<string, { nameAr: string; nameEn: string }> = {
    'COMPETING': { nameAr: 'التنافسي', nameEn: 'Competing' },
    'COLLABORATING': { nameAr: 'التعاوني', nameEn: 'Collaborating' },
    'COMPROMISING': { nameAr: 'التوفيقي', nameEn: 'Compromising' },
    'AVOIDING': { nameAr: 'التجنبي', nameEn: 'Avoiding' },
    'ACCOMMODATING': { nameAr: 'التكيفي', nameEn: 'Accommodating' }
};

export function calculateConflictStyle(answers: UserAnswer[]): AssessmentResult {
    const scores: Record<string, number> = {};
    Object.keys(CONFLICT_STYLES).forEach(k => scores[k] = 0);

    answers.forEach(ans => {
        const question = QUESTIONS.find(q => q.id === ans.questionId);
        if (!question || question.toolId !== 'conflict_styles') return;
        scores[question.dimension] += ans.value;
    });

    const maxStyle = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return {
        toolId: 'conflict_styles',
        scores,
        label: maxStyle,
        details: {
            style: CONFLICT_STYLES[maxStyle]
        }
    };
}
