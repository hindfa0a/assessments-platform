import { UserAnswer, AssessmentResult } from '../types';
import { QUESTIONS } from '../data';

export const STRENGTHS_DOMAINS = {
    EXECUTING: { nameAr: 'التنفيذ', nameEn: 'Executing', strengths: ['ACHIEVER', 'DISCIPLINE', 'FOCUS', 'RESPONSIBILITY'] },
    INFLUENCING: { nameAr: 'التأثير', nameEn: 'Influencing', strengths: ['COMMUNICATION', 'COMMAND'] },
    RELATIONSHIP: { nameAr: 'بناء العلاقات', nameEn: 'Relationship Building', strengths: ['EMPATHY', 'HARMONY'] },
    STRATEGIC: { nameAr: 'التفكير الاستراتيجي', nameEn: 'Strategic Thinking', strengths: ['ANALYTICAL', 'STRATEGIC'] }
};

export const STRENGTHS_LIST: Record<string, { nameAr: string; nameEn: string; domain: string }> = {
    'ACHIEVER': { nameAr: 'المُنجز', nameEn: 'Achiever', domain: 'EXECUTING' },
    'DISCIPLINE': { nameAr: 'المنضبط', nameEn: 'Discipline', domain: 'EXECUTING' },
    'FOCUS': { nameAr: 'المركّز', nameEn: 'Focus', domain: 'EXECUTING' },
    'RESPONSIBILITY': { nameAr: 'المسؤول', nameEn: 'Responsibility', domain: 'EXECUTING' },
    'COMMUNICATION': { nameAr: 'المتواصل', nameEn: 'Communication', domain: 'INFLUENCING' },
    'COMMAND': { nameAr: 'القائد', nameEn: 'Command', domain: 'INFLUENCING' },
    'EMPATHY': { nameAr: 'المتعاطف', nameEn: 'Empathy', domain: 'RELATIONSHIP' },
    'HARMONY': { nameAr: 'المتناغم', nameEn: 'Harmony', domain: 'RELATIONSHIP' },
    'ANALYTICAL': { nameAr: 'المحلل', nameEn: 'Analytical', domain: 'STRATEGIC' },
    'STRATEGIC': { nameAr: 'الاستراتيجي', nameEn: 'Strategic', domain: 'STRATEGIC' }
};

export function calculateStrengths(answers: UserAnswer[]): AssessmentResult {
    const scores: Record<string, number> = {};
    Object.keys(STRENGTHS_LIST).forEach(k => scores[k] = 0);

    answers.forEach(ans => {
        const question = QUESTIONS.find(q => q.id === ans.questionId);
        if (!question || question.toolId !== 'strengths') return;

        scores[question.dimension] += ans.value;
    });

    // Top 5
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top5 = ranked.slice(0, 5).map(r => r[0]);

    return {
        toolId: 'strengths',
        scores,
        details: {
            top5: top5.map(key => ({
                key,
                score: scores[key],
                ...STRENGTHS_LIST[key]
            }))
        }
    };
}
