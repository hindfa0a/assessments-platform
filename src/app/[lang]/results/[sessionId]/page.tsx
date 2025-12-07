import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { checkPaymentStatus, checkSessionCoupleStatus, checkTeamStatus } from "@/lib/supabase/actions";
import { ResultsContainer } from "@/components/results/ResultsContainer";
import { AIAnalysisReport } from "@/components/results/AIAnalysisReport";
import { CouplesDashboard } from "@/components/couples/CouplesDashboard";
import { CouplesReport } from "@/components/results/CouplesReport";
import { TeamDashboard } from "@/components/teams/TeamDashboard";
import { TeamReport } from "@/components/results/TeamReport";

export default async function ResultsPage({ params }: { params: Promise<{ lang: string; sessionId: string }> }) {
    const { lang, sessionId } = await params;
    const isAr = lang === "ar";

    // 1. Check Payment Status
    const { status } = await checkPaymentStatus(sessionId);

    // 2. Check Use Case Status (Couples or Teams)
    let coupleStatus = await checkSessionCoupleStatus(sessionId);

    // FETCH SESSION LOCALLY TO DETERMINE TEAM STATUS
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: session } = await supabase.from('assessment_sessions').select('*').eq('id', sessionId).single();

    // 3. Determine Flow & Configuration
    const isTeamFlow = session?.session_type === 'team' || !!session?.parent_session_id;
    const isCouplesFlow = coupleStatus.isCouple;
    const isPaid = status === 'paid' || status === 'unpaid_demo';

    // Get Use Case Config
    const useCaseId = session?.use_case || 'major_selection';
    const useCaseName = isAr ? (useCaseId === 'career_change' ? 'تغيير المسار الوظيفي' : 'اختيار التخصص الجامعي') : (useCaseId === 'career_change' ? 'Career Change' : 'Major Selection');
    const price = (isTeamFlow || isCouplesFlow) ? (isTeamFlow ? 50 : 20) : 10;

    // Override titles for Multi-participant
    const displayTitle = isTeamFlow
        ? (isAr ? "ديناميكيات الفريق" : "Team Dynamics")
        : isCouplesFlow
            ? (isAr ? "توافق الأزواج" : "Couples Compatibility")
            : useCaseName;

    // Determine which cards to show based on Use Case
    const showMBTI = useCaseId === 'major_selection';
    const showHolland = useCaseId === 'major_selection';
    const showBigFive = useCaseId === 'career_change' || useCaseId === 'big_five_demo';
    const showWorkValues = useCaseId === 'career_change';

    // If team flow, get team status
    let teamData = null;
    if (isTeamFlow && session?.share_code) {
        teamData = await checkTeamStatus(session.share_code);
    }

    // MOCK DATA (Ideally fetch processed results from DB)
    const mockResults = {
        mbti: { type: "INTJ", nameAr: "المهندس المعماري", nameEn: "The Architect", descAr: "مفكر استراتيجي...", descEn: "Strategic thinker..." },
        holland: { code: "RIA", topInterests: ["Realistic", "Investigative", "Artistic"] },
        bigFive: { highTraits: isAr ? ["الانبساط", "الانفتاح"] : ["Extraversion", "Openness"] },
        workValues: { topValues: isAr ? ["الإنجاز", "الاستقلالية"] : ["Achievement", "Independence"] }
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-8">
                {isAr ? "نتيجة التقييم" : "Assessment Results"} - {displayTitle}
            </h1>

            {/* Couples Dashboard */}
            {isCouplesFlow && coupleStatus.shareCode && (
                <div className="mb-8">
                    <CouplesDashboard
                        sessionId={sessionId}
                        shareCode={coupleStatus.shareCode}
                        lang={lang}
                        isReadyForPayment={!!coupleStatus.isReadyForPayment}
                        isPaid={isPaid}
                        partnerStatus={coupleStatus.isReadyForPayment ? 'completed' : 'waiting'}
                    />
                </div>
            )}

            {/* Team Dashboard */}
            {isTeamFlow && teamData && (
                <div className="mb-8">
                    <TeamDashboard
                        sessionId={sessionId}
                        shareCode={session.share_code!}
                        lang={lang}
                        teamName={teamData.teamSession?.team_name || "Team"}
                        isLeader={session.participant_role === 'leader'}
                        members={teamData.members || []}
                        isReadyForAnalysis={!!teamData.isReadyForAnalysis}
                        isPaid={isPaid}
                    />
                </div>
            )}

            <ResultsContainer
                status={status}
                sessionId={sessionId}
                lang={lang}
                price={price}
                useCaseName={displayTitle}
                actionsDisabled={isTeamFlow && !teamData?.isReadyForAnalysis}
                actionsDisabledMessage={isAr ? `يجب انضمام ${3 - ((teamData?.members?.length || 0) + 1)} أعضاء إضافيين.` : `Waiting for ${(3 - ((teamData?.members?.length || 0) + 1))} more members.`}
            >
                <div className="grid gap-6">

                    {/* Use Case 1: MBTI & Holland */}
                    {showMBTI && (
                        <Card className="border-l-4 border-l-purple-600 shadow-md">
                            <CardHeader><CardTitle>{isAr ? "نمط الشخصية (MBTI)" : "Personality Type (MBTI)"}</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-4xl font-extrabold text-purple-600 mb-2">{mockResults.mbti.type}</h2>
                                        <h3 className="text-xl font-semibold mb-2">{isAr ? mockResults.mbti.nameAr : mockResults.mbti.nameEn}</h3>
                                        <p className="text-muted-foreground">{isAr ? mockResults.mbti.descAr : mockResults.mbti.descEn}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {showHolland && (
                        <Card className="border-l-4 border-l-blue-600 shadow-md">
                            <CardHeader><CardTitle>{isAr ? "الميول المهنية (Holland)" : "Career Interests (Holland)"}</CardTitle></CardHeader>
                            <CardContent>
                                <div>
                                    <h2 className="text-4xl font-extrabold text-blue-600 mb-2">{mockResults.holland.code}</h2>
                                    <div className="flex gap-2 mt-2">
                                        {mockResults.holland.topInterests.map(interest => (
                                            <span key={interest} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{interest}</span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Use Case 2: Big Five & Work Values */}
                    {showBigFive && (
                        <Card className="border-l-4 border-l-green-600 shadow-md">
                            <CardHeader><CardTitle>{isAr ? "السمات الخمس الكبرى" : "Big Five Traits"}</CardTitle></CardHeader>
                            <CardContent>
                                <p className="mb-2 font-semibold">{isAr ? "أبرز السمات:" : "High Traits:"}</p>
                                <div className="flex gap-2">
                                    {mockResults.bigFive.highTraits.map(trait => (
                                        <span key={trait} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{trait}</span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {showWorkValues && (
                        <Card className="border-l-4 border-l-orange-600 shadow-md">
                            <CardHeader><CardTitle>{isAr ? "القيم المهنية" : "Work Values"}</CardTitle></CardHeader>
                            <CardContent>
                                <p className="mb-2 font-semibold">{isAr ? "القيم العليا:" : "Top Values:"}</p>
                                <div className="flex gap-2">
                                    {mockResults.workValues.topValues.map(val => (
                                        <span key={val} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">{val}</span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Couples Report */}
                    {isCouplesFlow && isPaid && (
                        <CouplesReport
                            sessionId={sessionId}
                            lang={lang}
                        />
                    )}

                    {/* Team Report */}
                    {isTeamFlow && isPaid && teamData && (
                        <TeamReport
                            sessionId={sessionId}
                            lang={lang}
                            members={teamData.members}
                        />
                    )}

                    {/* AI Analysis Report (Generic for Individual Only) */}
                    {!isCouplesFlow && !isTeamFlow && (
                        <AIAnalysisReport
                            sessionId={sessionId}
                            lang={lang}
                            isPaid={isPaid}
                        />
                    )}

                    {/* Note: AI for Teams/Couples could be integrated into their specific reports or enabled here if desired */}
                    {/* For MVP, let's keep generic AI analysis enabled for all if paid, just maybe different prompt? 
                        But spec said Couples/Teams have their own sections. 
                        Let's enable generic AI for everyone for extra value? 
                        Or hide it to focus on the specialized report.
                        Let's hide it for multi-participant to avoid confusion with "Individual Analysis" vs "Group".
                    */}

                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-200">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold mb-4">{isAr ? "التوصيات" : "Recommendations"}</h3>
                            <ul className="list-disc list-inside space-y-2">
                                <li>{isAr ? "حجز جلسة استشارية" : "Book Consultation"}</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </ResultsContainer>
        </div>
    );
}
