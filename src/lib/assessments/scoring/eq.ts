import { UserAnswer, AssessmentResult } from '../types';
import { QUESTIONS } from '../data';

export const EQ_DIMENSIONS: Record<string, { nameAr: string; nameEn: string }> = {
    'SELF_AWARENESS': { nameAr: 'الوعي الذاتي', nameEn: 'Self-Awareness' },
    'SELF_REGULATION': { nameAr: 'تنظيم الذات', nameEn: 'Self-Regulation' },
    'MOTIVATION': { nameAr: 'التحفيز', nameEn: 'Motivation' },
    'EMPATHY': { nameAr: 'التعاطف', nameEn: 'Empathy' },
    'SOCIAL_SKILLS': { nameAr: 'المهارات الاجتماعية', nameEn: 'Social Skills' }
};

export function calculateEQ(answers: UserAnswer[]): AssessmentResult {
    const scores: Record<string, number> = {};
    Object.keys(EQ_DIMENSIONS).forEach(k => scores[k] = 0);

    answers.forEach(ans => {
        const question = QUESTIONS.find(q => q.id === ans.questionId);
        if (!question || question.toolId !== 'eq') return;
        scores[question.dimension] += ans.value;
    });

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    return {
        toolId: 'eq',
        scores,
        details: {
            totalScore,
            dimensions: Object.keys(EQ_DIMENSIONS).map(key => ({
                key,
                nameAr: EQ_DIMENSIONS[key].nameAr,
                nameEn: EQ_DIMENSIONS[key].nameEn,
                score: scores[key],
                level: scores[key] >= 4 ? 'High' : (scores[key] <= -4 ? 'Low' : 'Medium')
            }))
        }
    };
}
