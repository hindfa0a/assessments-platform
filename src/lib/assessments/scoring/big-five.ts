import { UserAnswer, AssessmentResult } from '../types';
import { QUESTIONS } from '../data';

type BigFiveTrait = 'O' | 'C' | 'E' | 'A' | 'N';

export const BIG_FIVE_TRAITS: Record<string, { nameAr: string; nameEn: string }> = {
    'O': { nameAr: 'الانفتاح', nameEn: 'Openness' },
    'C': { nameAr: 'الضمير الحي', nameEn: 'Conscientiousness' },
    'E': { nameAr: 'الانبساط', nameEn: 'Extraversion' },
    'A': { nameAr: 'المقبولية', nameEn: 'Agreeableness' },
    'N': { nameAr: 'العصابية', nameEn: 'Neuroticism' }
};

export function calculateBigFive(answers: UserAnswer[]): AssessmentResult {
    const scores: Record<BigFiveTrait, number> = {
        'O': 0, 'C': 0, 'E': 0, 'A': 0, 'N': 0
    };

    answers.forEach(ans => {
        const question = QUESTIONS.find(q => q.id === ans.questionId);
        if (!question || question.toolId !== 'big_five') return;

        // Reverse scoring handling
        // If reverseScored, value 2 becomes -2, etc. (Or based on logic in prompt: 5-point Likert)
        // Our input 'value' is -2 to +2.
        // If reverse: -2 -> +2, +2 -> -2. simple negation.

        let scoreToAdd = ans.value;
        if (question.reverseScored) {
            scoreToAdd = -ans.value;
        }
        scores[question.dimension as BigFiveTrait] += scoreToAdd;
    });

    return {
        toolId: 'big_five',
        scores,
        details: {
            traits: BIG_FIVE_TRAITS
        }
    };
}
