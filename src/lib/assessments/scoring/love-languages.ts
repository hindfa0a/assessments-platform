import { UserAnswer, AssessmentResult } from '../types';
import { QUESTIONS } from '../data';

export const LOVE_LANGUAGES: Record<string, { nameAr: string; nameEn: string }> = {
    'WORDS': { nameAr: 'كلمات التأكيد', nameEn: 'Words of Affirmation' },
    'TIME': { nameAr: 'الوقت النوعي', nameEn: 'Quality Time' },
    'GIFTS': { nameAr: 'تلقي الهدايا', nameEn: 'Receiving Gifts' },
    'ACTS': { nameAr: 'أفعال الخدمة', nameEn: 'Acts of Service' },
    'TOUCH': { nameAr: 'اللمس الجسدي', nameEn: 'Physical Touch' }
};

export function calculateLoveLanguages(answers: UserAnswer[]): AssessmentResult {
    const scores: Record<string, number> = {};
    Object.keys(LOVE_LANGUAGES).forEach(k => scores[k] = 0);

    answers.forEach(ans => {
        const question = QUESTIONS.find(q => q.id === ans.questionId);
        if (!question || question.toolId !== 'love_languages') return;

        scores[question.dimension] += ans.value;
    });

    // Rank
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = ranked[0][0];

    return {
        toolId: 'love_languages',
        scores,
        label: primary,
        details: {
            primary: { ...LOVE_LANGUAGES[primary], score: ranked[0][1] },
            ranked: ranked.map(([k, s]) => ({ ...LOVE_LANGUAGES[k], score: s }))
        }
    };
}
