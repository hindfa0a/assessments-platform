import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn('OPENAI_API_KEY is not set');
}

export const openai = new OpenAI({
    apiKey: apiKey,
});

export type AnalysisRequest = {
    sessionId: string;
    useCase: string; // 'major_selection', etc.
    lang: 'ar' | 'en';
    results: any; // The calculated results object
};

export type AnalysisResponse = {
    content: string; // Markdown content
};
