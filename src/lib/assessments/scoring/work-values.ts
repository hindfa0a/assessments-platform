import { UserAnswer, AssessmentResult } from '../types';
import { QUESTIONS } from '../data';

export const WORK_VALUES: Record<string, { nameAr: string; nameEn: string }> = {
    'ACHIEVEMENT': { nameAr: 'الإنجاز', nameEn: 'Achievement' },
    'INDEPENDENCE': { nameAr: 'الاستقلالية', nameEn: 'Independence' },
    'RECOGNITION': { nameAr: 'التقدير', nameEn: 'Recognition' },
    'RELATIONSHIPS': { nameAr: 'العلاقات', nameEn: 'Relationships' },
    'SUPPORT': { nameAr: 'الدعم', nameEn: 'Support' },
    'WORKING_CONDITIONS': { nameAr: 'ظروف العمل', nameEn: 'Working Conditions' }
};

export function calculateWorkValues(answers: UserAnswer[]): AssessmentResult {
    const scores: Record<string, number> = {};

    // Initialize
    Object.keys(WORK_VALUES).forEach(key => scores[key] = 0);

    answers.forEach(ans => {
        const question = QUESTIONS.find(q => q.id === ans.questionId);
        if (!question || question.toolId !== 'work_values') return;

        // Simple sum of Likert values
        scores[question.dimension] = (scores[question.dimension] || 0) + ans.value;
    });

    // Rank
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top3 = ranked.slice(0, 3).map(r => r[0]);

    return {
        toolId: 'work_values',
        scores,
        details: {
            rankedValues: ranked.map(([key, score]) => ({
                key,
                score,
                ...WORK_VALUES[key]
            })),
            top3
        }
    };
}
