
import { QUESTIONS } from '../src/lib/assessments/data';
import { calculateMBTI } from '../src/lib/assessments/scoring/mbti';
import { calculateHolland } from '../src/lib/assessments/scoring/holland';
import { calculateBigFive } from '../src/lib/assessments/scoring/big-five';
import { calculateAttachment } from '../src/lib/assessments/scoring/attachment';
import { calculateLoveLanguages } from '../src/lib/assessments/scoring/love-languages';
import { calculateWorkValues } from '../src/lib/assessments/scoring/work-values';
import { calculateStrengths } from '../src/lib/assessments/scoring/strengths';
import { calculateEQ } from '../src/lib/assessments/scoring/eq';
import { calculateConflictStyle } from '../src/lib/assessments/scoring/conflict';

const SCORERS: Record<string, Function> = {
    'mbti': calculateMBTI,
    'holland': calculateHolland,
    'big_five': calculateBigFive,
    'attachment': calculateAttachment,
    'love_languages': calculateLoveLanguages,
    'work_values': calculateWorkValues,
    'strengths': calculateStrengths,
    'eq': calculateEQ,
    'conflict_styles': calculateConflictStyle
};

console.log("========================================");
console.log("BASEERA ASSESSMENT VALIDATION REPORT");
console.log("========================================");

let passedCount = 0;
let failedCount = 0;
const issues: string[] = [];

Object.keys(SCORERS).forEach((toolId, index) => {
    const scorer = SCORERS[toolId];
    const qs = QUESTIONS.filter(q => q.toolId === toolId);

    console.log(`\n${index + 1}. ${toolId.toUpperCase()} (${toolId})`);
    console.log(`   Total Questions: ${qs.length}`);

    // 1. Balance Check
    const balance: Record<string, { pos: number, neg: number }> = {};
    const dimensions = new Set(qs.map(q => (q as any).dimension || (q as any).trait || (q as any).type || (q as any).style || (q as any).value));
    // In QUESTIONS array from data.ts: 
    // mbti -> dimension
    // holland -> dimension (mapped from type?)
    // big_five -> dimension (mapped from trait?)
    // data.ts populates 'dimension' for all.

    qs.forEach(q => {
        const dim = (q as any).dimension || (q as any).trait || (q as any).type || (q as any).style || (q as any).value;
        if (!balance[dim]) balance[dim] = { pos: 0, neg: 0 };
        if (q.reverseScored) balance[dim].neg++;
        else balance[dim].pos++;
    });

    console.log("   Dimensions:");
    Object.entries(balance).forEach(([dim, counts]) => {
        const check = counts.pos === counts.neg ? "✓" : (toolId === 'mbti' ? "IMBALANCE FIXED?" : "");
        // MBTI should be 6/6 now.
        console.log(`   - ${dim}: ${counts.pos} positive, ${counts.neg} negative ${counts.pos === counts.neg ? '✓' : '⚠️'}`);
        if (counts.pos !== counts.neg) {
            // Some tools might not intend to be balanced (e.g. Holland codes might just be summation of X questions per type, all positive).
            if (toolId === 'holland' || toolId === 'work_values' || toolId === 'love_languages' || toolId === 'strengths') {
                // These usually have NO reverse scoring, so All Positive is expected.
                // We verify if they have ANY reverse scoring.
            } else {
                issues.push(`${toolId} dimension ${dim} Unbalanced (${counts.pos}/${counts.neg})`);
            }
        }
    });

    // 2. Simulations

    // Straight Line (+1)
    const straightAnswers = qs.map(q => ({ questionId: q.id, value: 1, responseTimeMs: 100, timestamp: 0 } as any));
    const straightResult = scorer(straightAnswers);

    // Max Positive (+2 to Pos, -2 to Neg) -> Maximizes the Score for Positive Pole
    const maxPosAnswers = qs.map(q => ({
        questionId: q.id,
        value: q.reverseScored ? -2 : 2,
        responseTimeMs: 100,
        timestamp: 0
    } as any));
    const maxPosResult = scorer(maxPosAnswers);

    // Max Negative (-2 to Pos, +2 to Neg) -> Maximizes the Score for Negative Pole
    const maxNegAnswers = qs.map(q => ({
        questionId: q.id,
        value: q.reverseScored ? 2 : -2,
        responseTimeMs: 100,
        timestamp: 0
    } as any));
    const maxNegResult = scorer(maxNegAnswers);

    // Log Results
    console.log(`   Straight-line Test Result:`, JSON.stringify(straightResult.scores || straightResult.details));

    // Validation Logic
    let status = "PASS";

    // Specific MBTI Check
    if (toolId === 'mbti') {
        const s = straightResult.scores;
        if (s.EI !== 0 || s.SN !== 0 || s.TF !== 0 || s.JP !== 0) {
            status = "FAIL (Straight Line != 0)";
            issues.push(`MBTI Straight Line failed: ${JSON.stringify(s)}`);
        }
    }

    console.log(`   STATUS: ${status === 'PASS' ? 'PASS ✓' : 'FAIL ❌'}`);
    if (status === 'PASS') passedCount++; else failedCount++;
});

console.log("\n========================================");
console.log("SUMMARY");
console.log("========================================");
console.log(`Passed: ${passedCount}/${Object.keys(SCORERS).length}`);
console.log(`Failed: ${failedCount}/${Object.keys(SCORERS).length}`);
console.log("\nIssues Found:");
issues.forEach(i => console.log(`- ${i}`));
console.log("========================================");
