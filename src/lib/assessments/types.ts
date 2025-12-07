export type ToolId =
    | 'mbti'
    | 'holland'
    | 'big_five'
    | 'work_values'
    | 'attachment'
    | 'love_languages'
    | 'strengths'
    | 'eq'
    | 'conflict_styles';

export type UseCaseId =
    | 'major_selection'
    | 'career_change'
    | 'couples'
    | 'teams'
    | 'big_five_demo';

export type UseCaseConfig = {
    id: UseCaseId;
    nameAr: string;
    nameEn: string;
    tools: ToolId[];
    price: number;
};

export type Question = {
    id: string;
    toolId: ToolId;
    textAr: string;
    textEn: string;
    dimension: string; // e.g., 'EI', 'R', 'Openness'
    reverseScored?: boolean;
};

export type AssessmentConfig = {
    toolId: ToolId;
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    totalQuestions: number;
};

export type UserAnswer = {
    questionId: string;
    value: number; // -2 to +2
    responseTimeMs: number;
    timestamp: number;
};

export type AssessmentResult = {
    toolId: ToolId;
    scores: Record<string, number>; // { EI: 5, SN: -3 }
    label?: string; // e.g., "INTJ"
    details?: any; // Extra data like descriptions
};
