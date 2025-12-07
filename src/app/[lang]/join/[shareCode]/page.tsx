import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { joinCoupleSession, joinTeamSession } from "@/lib/supabase/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, UserPlus, ArrowRight, Users } from "lucide-react";

interface JoinPageProps {
    params: Promise<{
        lang: string;
        shareCode: string;
    }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
    const { lang, shareCode } = await params;
    const isAr = lang === 'ar';
    const supabase = await createClient();

    // 2. Determine Type (Team or Couple)
    let type = 'unknown';
    let label = 'Unknown';
    let teamName = '';

    const { data: couple } = await supabase.from('couple_sessions').select('*').eq('share_code', shareCode).single();
    if (couple) {
        type = 'couple';
        label = isAr ? 'تحليل توافق الأزواج' : 'Couples Compatibility';
    } else {
        const { data: team } = await supabase.from('team_sessions').select('*').eq('share_code', shareCode).single();
        if (team) {
            type = 'team';
            label = team.team_name;
            teamName = team.team_name;
        }
    }

    // 1. Check Auth (MVP: strict check)
    const { data: { user } } = await supabase.auth.getUser();

    // 3. Action Wrapper
    async function handleJoin() {
        "use server";
        // Re-check auth inside action just in case, or reliance on server action's internal check
        // But we need the USER's name. For MVP, we'll use a placeholder or their name from DB if available.
        // We really should have a form input for name if it's a new user.
        // But for MVP, let's use "Partner".

        let result;
        if (type === 'couple') {
            result = await joinCoupleSession(shareCode, "Partner");
        } else {
            result = await joinTeamSession(shareCode, "Member");
        }

        if (result.success && result.sessionId) {
            redirect(`/${lang}/assessment/${type === 'couple' ? 'couples' : 'teams'}?sessionId=${result.sessionId}`);
        } else {
            // Error handling: redirect to error page or params?
            // For simple MVP: throw error or redirect with error param
            redirect(`/${lang}/join/${shareCode}?error=${encodeURIComponent(result.error || "Failed to join")}`);
        }
    }

    if (type === 'unknown') {
        // Handle invalid code
        return (
            <div className="container flex items-center justify-center min-h-screen py-12 px-4">
                <Card className="w-full max-w-md border-red-200">
                    <CardContent className="pt-6 text-center text-red-600">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                        <p>{isAr ? "رمز غير صالح" : "Invalid Code"}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!user) {
        // Show "Login to Join" UI
        return (
            <div className="container flex items-center justify-center min-h-screen py-12 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">{isAr ? "تسجيل الدخول مطلوب" : "Login Required"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-muted-foreground">
                            {isAr ? "يجب عليك تسجيل الدخول للانضمام إلى جلسة شريكك." : "You must login to join your partner's session."}
                        </p>
                        <Button asChild className="w-full">
                            <a href="/login">{isAr ? "تسجيل الدخول / إنشاء حساب" : "Login / Sign Up"}</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Auto-join or Manual confirmation?
    // Let's show a "Join Session" card to confirm they want to join.
    // Also allows us to capture Name if we wanted to add a form.

    return (
        <div className="container flex items-center justify-center min-h-screen py-12 px-4">
            <Card className="w-full max-w-md border-t-4 border-t-indigo-600 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex flex-col items-center gap-2 text-2xl">
                        {type === 'team' ? (
                            <Users className="w-12 h-12 text-indigo-600 bg-indigo-100 p-2 rounded-full" />
                        ) : (
                            <UserPlus className="w-12 h-12 text-purple-600 bg-purple-100 p-2 rounded-full" />
                        )}
                        {isAr ? "انضمام للفريق/الجلسة" : "Join Session"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <p className="text-sm text-muted-foreground mb-1">{isAr ? "رمز الدعوة" : "Invitation Code"}</p>
                            <p className="text-3xl font-mono font-bold tracking-widest text-slate-800">{shareCode}</p>
                            {teamName && <p className="mt-2 font-bold text-indigo-700">{teamName}</p>}
                        </div>

                        <p className="text-muted-foreground">
                            {isAr
                                ? `أنت على وشك الانضمام لـ: ${label}`
                                : `You are about to join: ${label}`}
                        </p>

                        <form action={handleJoin}>
                            <Button size="lg" className="w-full gap-2 text-lg">
                                {isAr ? "ابدأ التحليل الآن" : "Start Analysis Now"}
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
