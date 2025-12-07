import { UserAnswer, AssessmentResult } from '../types';
import { QUESTIONS } from '../data';

interface HollandTypeData {
    code: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    careers: string[];
}

export const HOLLAND_TYPES: Record<string, HollandTypeData> = {
    'R': {
        code: 'R',
        nameAr: 'واقعي',
        nameEn: 'Realistic',
        descriptionAr: 'يفضل التعامل مع الأشياء، الأدوات، والآلات. يميل إلى العمل اليدوي والعملي.',
        descriptionEn: 'Prefers working with things, tools, and machines. Inclined towards manual and practical work.',
        careers: ['هندسة ميكانيكية', 'زراعة', 'برمجة شبكات']
    },
    'I': {
        code: 'I',
        nameAr: 'استقصائي',
        nameEn: 'Investigative',
        descriptionAr: 'يفضل التعامل مع الأفكار والنظريات. يميل إلى التحليل والبحث والاكتشاف.',
        descriptionEn: 'Prefers working with ideas and theories. Inclined towards analysis, research, and discovery.',
        careers: ['طب', 'فيزياء', 'تحليل بيانات']
    },
    // ... others (A, S, E, C)
};

export function calculateHolland(answers: UserAnswer[]): AssessmentResult {
    const scores: Record<string, number> = {
        'R': 0, 'I': 0, 'A': 0, 'S': 0, 'E': 0, 'C': 0
    };

    answers.forEach(ans => {
        const question = QUESTIONS.find(q => q.id === ans.questionId);
        if (!question || question.toolId !== 'holland') return;

        // value is -2 to +2. No reverse scoring usually in Holland (or specified as "No reverse scoring")
        scores[question.dimension] += ans.value;
    });

    // Sort scores descending, break ties alphabetically
    const sortedTypes = Object.entries(scores).sort((a, b) => {
        if (b[1] !== a[1]) {
            return b[1] - a[1]; // Descending score
        }
        return a[0].localeCompare(b[0]); // Ascending Alphabetical
    });

    // Top 3
    const top3 = sortedTypes.slice(0, 3).map(t => t[0]).join(''); // e.g. "RIA"

    return {
        toolId: 'holland',
        scores,
        label: top3, // The 3-letter code
        details: {
            primary: HOLLAND_TYPES[top3[0]],
            secondary: HOLLAND_TYPES[top3[1]],
            tertiary: HOLLAND_TYPES[top3[2]],
            fullRanking: sortedTypes
        }
    };
}
