import { UserAnswer, AssessmentResult } from '../types';
import { QUESTIONS } from '../data';

type MBTIDimension = 'EI' | 'SN' | 'TF' | 'JP';

interface MBTITypeData {
    code: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    majors: string[];
}

export const MBTI_TYPES: Record<string, MBTITypeData> = {
    'INTJ': {
        code: 'INTJ',
        nameAr: 'المهندس المعماري',
        nameEn: 'The Architect',
        descriptionAr: 'مفكر استراتيجي وخيال واسع، لديه خطة لكل شيء. يتميز بالقدرة على رؤية الصورة الكبيرة وتحليل الأنظمة المعقدة.',
        descriptionEn: 'Imaginative and strategic thinkers, with a plan for everything. Known for seeing the big picture and analyzing complex systems.',
        majors: ['هندسة البرمجيات', 'الهندسة المعمارية', 'العلوم المالية', 'الفيزياء', 'القانون', 'إدارة المشاريع']
    },
    // ... other types would go here. Using a Proxy or fallback for now to avoid huge file.
};

export function calculateMBTI(answers: UserAnswer[]): AssessmentResult {
    const scores: Record<MBTIDimension, number> = {
        'EI': 0,
        'SN': 0,
        'TF': 0,
        'JP': 0
    };

    answers.forEach(ans => {
        const question = QUESTIONS.find(q => q.id === ans.questionId);
        if (!question || question.toolId !== 'mbti') return;

        const dimension = question.dimension as MBTIDimension;
        // value is -2 to +2
        // If NOT reverse scored: +2 aligns with First Letter (E, S, T, J) which is Positive direction
        // If reverse scored: +2 aligns with Second Letter (I, N, F, P) which is Negative direction

        let scoreToAdd = ans.value;
        if (question.reverseScored) {
            scoreToAdd = -ans.value;
        }

        scores[dimension] += scoreToAdd;
    });

    // Determine Letters
    // Tie-breaking: Default to Introversion, Intuition, Feeling, Perceiving if 0 (Standard fallbacks)
    const letters = {
        E: scores['EI'] > 0 ? 'E' : 'I',
        S: scores['SN'] > 0 ? 'S' : 'N',
        T: scores['TF'] > 0 ? 'T' : 'F',
        J: scores['JP'] > 0 ? 'J' : 'P'
    };

    // No longer using X or dashes
    const typeCode = `${letters.E}${letters.S}${letters.T}${letters.J}`; // e.g. INTJ

    // Find details - simplified lookup ignoring X for the sample match
    const lookupCode = typeCode.replace(/-/g, 'I'); // Fallback for lookup if needed, logic to be refined
    const details = MBTI_TYPES[lookupCode] || MBTI_TYPES['INTJ']; // Fallback

    return {
        toolId: 'mbti',
        scores,
        label: typeCode,
        details: {
            ...details,
            isBalanced: typeCode.includes('-')
        }
    };
}
