import { Question, AssessmentConfig, ToolId } from './types';
import questionsData from './questions.json';

export const TOOLS: Record<string, AssessmentConfig> = {
    mbti: {
        toolId: 'mbti',
        nameAr: 'تحليل نمط الشخصية',
        nameEn: 'Personality Type Indicator',
        descriptionAr: 'اكتشف نمط شخصيتك من بين 16 نمطاً عالمياً',
        descriptionEn: 'Discover your personality type among 16 global types',
        totalQuestions: 48
    },
    holland: {
        toolId: 'holland',
        nameAr: 'الميول المهنية',
        nameEn: 'Career Interests',
        descriptionAr: 'حدد بيئة العمل المناسبة لك',
        descriptionEn: 'Identify the suitable work environment for you',
        totalQuestions: 48
    },
    big_five: {
        toolId: 'big_five',
        nameAr: 'السمات الخمس الكبرى',
        nameEn: 'Big Five Traits',
        descriptionAr: 'تحليل عميق لسمات شخصيتك الأساسية',
        descriptionEn: 'Deep analysis of your core personality traits',
        totalQuestions: 50
    },
    work_values: {
        toolId: 'work_values',
        nameAr: 'القيم المهنية',
        nameEn: 'Work Values',
        descriptionAr: 'حدد ما يهمك حقاً في بيئة العمل',
        descriptionEn: 'Identify what matters most to you in a work environment',
        totalQuestions: 20
    },
    attachment: {
        toolId: 'attachment',
        nameAr: 'أنماط التعلق',
        nameEn: 'Attachment Style',
        descriptionAr: 'افهم طريقتك في بناء العلاقات',
        descriptionEn: 'Understand how you bond in relationships',
        totalQuestions: 20
    },
    love_languages: {
        toolId: 'love_languages',
        nameAr: 'لغات الحب',
        nameEn: 'Love Languages',
        descriptionAr: 'اكتشف كيف تعبر عن الحب وتستقبله',
        descriptionEn: 'Discover how you express and receive love',
        totalQuestions: 30
    },
    strengths: {
        toolId: 'strengths',
        nameAr: 'نقاط القوة',
        nameEn: 'Strengths Finder',
        descriptionAr: 'اكتشف نقاط قوتك وكيفية استثمارها',
        descriptionEn: 'Discover your top strengths and how to potentialize them',
        totalQuestions: 30
    },
    eq: {
        toolId: 'eq',
        nameAr: 'الذكاء العاطفي',
        nameEn: 'Emotional Intelligence',
        descriptionAr: 'قياس قدرتك على فهم وإدارة العواطف',
        descriptionEn: 'Measure your ability to understand and manage emotions',
        totalQuestions: 30
    },
    conflict_styles: {
        toolId: 'conflict_styles',
        nameAr: 'إدارة النزاعات',
        nameEn: 'Conflict Styles',
        descriptionAr: 'تعرف على أسلوبك في التعامل مع الخلافات',
        descriptionEn: 'Learn about your style in handling conflicts',
        totalQuestions: 20
    }
};

export const USE_CASES: Record<string, import('./types').UseCaseConfig> = {
    'major_selection': {
        id: 'major_selection',
        nameAr: 'اختيار التخصص الجامعي',
        nameEn: 'University Major Selection',
        tools: ['mbti', 'holland'],
        price: 10
    },
    'career_change': {
        id: 'career_change',
        nameAr: 'تغيير المسار الوظيفي',
        nameEn: 'Career Change',
        tools: ['big_five', 'work_values'],
        price: 10
    },
    'couples': {
        id: 'couples',
        nameAr: 'التوافق الزوجي',
        nameEn: 'Couples Compatibility',
        tools: ['attachment', 'love_languages'],
        price: 20
    },
    'teams': {
        id: 'teams',
        nameAr: 'ديناميكيات الفريق',
        nameEn: 'Team Dynamics',
        tools: ['strengths', 'eq', 'conflict_styles'],
        price: 50
    },
    'big_five_demo': {
        id: 'big_five_demo',
        nameAr: 'تجربة السمات الخمس (PoC)',
        nameEn: 'Big Five Demo (PoC)',
        tools: ['big_five'],
        price: 0
    }
};

const JSON_TO_TOOL_ID: Record<string, ToolId> = {
    'mbti': 'mbti',
    'holland': 'holland',
    'big_five': 'big_five',
    'work_values': 'work_values',
    'attachment_style': 'attachment',
    'love_languages': 'love_languages',
    'strengths': 'strengths',
    'emotional_intelligence': 'eq',
    'conflict_styles': 'conflict_styles'
};

export const QUESTIONS: Question[] = [];

// Safely iterate over the JSON data to populate QUESTIONS
Object.entries(questionsData.assessments).forEach(([jsonKey, value]) => {
    const toolId = JSON_TO_TOOL_ID[jsonKey];
    if (!toolId) {
        console.warn(`Unknown tool key in JSON: ${jsonKey}`);
        return;
    }

    const assessment = value as any;

    // Ensure questions exist
    if (Array.isArray(assessment.questions)) {
        assessment.questions.forEach((q: any) => {
            // Determine dimension from various possible keys in the JSON
            const dimension = q.dimension || q.type || q.trait || q.value || q.style || q.language || q.strength || '';

            QUESTIONS.push({
                id: q.id,
                toolId: toolId,
                dimension: dimension,
                textAr: q.text_ar,
                textEn: q.text_en,
                reverseScored: q.reverse_scored || false
            });
        });
    }
});
