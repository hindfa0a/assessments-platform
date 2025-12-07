
import { QUESTIONS } from '../src/lib/assessments/data';
import { calculateMBTI } from '../src/lib/assessments/scoring/mbti';

console.log("=== MBTI LOGIC & DATA AUDIT ===");

// 1. Audit Question Balance
const mbtiQs = QUESTIONS.filter(q => q.toolId === 'mbti');
const balance: Record<string, { total: number, positive: number, negative: number }> = {};

mbtiQs.forEach(q => {
    if (!balance[q.dimension]) balance[q.dimension] = { total: 0, positive: 0, negative: 0 };
    balance[q.dimension].total++;
    // If reverseScored is true, it favors the "Negative" pole (I, N, F, P)
    // If false, it favors the "Positive" pole (E, S, T, J)
    if (q.reverseScored) {
        balance[q.dimension].negative++;
    } else {
        balance[q.dimension].positive++;
    }
});

console.log("\n1. Question Balance Check:");
console.table(balance);

// 2. Simulation Test: "Strong E"
// User answers Strongly Agree (+2) to all 'False' (Positive/E) questions
// User answers Strongly Disagree (-2) to all 'True' (Negative/I) questions
// This should maximize the score for E.
console.log("\n2. Simulation: Max E, S, T, J Score");

const strongAnswers = mbtiQs.map(q => {
    // If not reverse (Positive question): Strongly Agree (+2) -> Score +2
    // If reverse (Negative question): Strongly Disagree (-2) -> Score -(-2) = +2
    const val = q.reverseScored ? -2 : 2;
    return {
        questionId: q.id,
        value: val,
        responseTimeMs: 100
    }
});

const result = calculateMBTI(strongAnswers.map(a => ({ ...a, timestamp: Date.now() })));
console.log("Result Type:", result.label);
console.log("Scores:", result.scores);

// 3. Simulation: Max I, N, F, P Score
// User answers Strongly Disagree (-2) to Positive
// User answers Strongly Agree (+2) to Negative
console.log("\n3. Simulation: Max I, N, F, P Score");
const inverseAnswers = mbtiQs.map(q => {
    // If not reverse (Positive): Strongly Disagree (-2) -> Score -2
    // If reverse (Negative): Strongly Agree (+2) -> Score -(+2) = -2
    const val = q.reverseScored ? 2 : -2;
    return {
        questionId: q.id,
        value: val,
        responseTimeMs: 100
    }
});

const inverseResult = calculateMBTI(inverseAnswers.map(a => ({ ...a, timestamp: Date.now() })));
console.log("Result Type:", inverseResult.label);
console.log("Scores:", inverseResult.scores);

// 3. Random Answers
const randomAnswers = QUESTIONS.filter(q => q.toolId === 'mbti').map(q => ({
    questionId: q.id,
    value: Math.floor(Math.random() * 5) - 2,
    responseTimeMs: 100
}));

const randomResult = calculateMBTI(randomAnswers.map(a => ({ ...a, timestamp: Date.now() })));
console.log("Result Type:", randomResult.label);
console.log("Scores:", randomResult.scores);


// 4. Simulation: "Straight Lining" (Agree to everything)
// This replicates the user's likely behavior.
console.log("\n4. Simulation: Straight Lining (Agree / +1 to ALL)");
const straightLineAnswers = mbtiQs.map(q => ({
    questionId: q.id,
    value: 1, // Agree
    responseTimeMs: 100
}));

const straightResult = calculateMBTI(straightLineAnswers.map(a => ({ ...a, timestamp: Date.now() })));
console.log("Result Type:", straightResult.label);
console.log("Scores:", straightResult.scores);
