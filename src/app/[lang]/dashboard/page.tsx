
import { getUserSessions } from "@/lib/supabase/actions";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage({ params }: { params: { lang: string } }) {
    const lang = params.lang;
    const isAr = lang === 'ar';
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${lang}/login`);
    }

    const { success, sessions } = await getUserSessions();

    return (
        <div className="min-h-screen bg-slate-50 font-inter">
            <Header lang={lang} />
            <main className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        {isAr ? "اختباراتي" : "My Assessments"}
                    </h1>
                    <Link href={`/${lang}/start`}>
                        <Button className="bg-brand-indigo hover:bg-brand-indigo/90">
                            {isAr ? "اختبار جديد" : "New Assessment"}
                        </Button>
                    </Link>
                </div>

                {!success || !sessions || sessions.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                {isAr ? "لم تقم بأي اختبارات بعد." : "You haven't taken any assessments yet."}
                            </p>
                            <Link href={`/${lang}/start`}>
                                <Button variant="outline">
                                    {isAr ? "ابدأ الآن" : "Start Now"}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {sessions.map((session: any) => {
                            const isPaid = session.payment_status === 'paid' || (session.payments && session.payments.some((p: any) => p.status === 'paid'));
                            const isCompleted = session.status === 'completed';

                            // Map use case to readable name
                            const getUseCaseName = (uc: string) => {
                                // Simplified mapping
                                if (uc === 'major_selection') return isAr ? 'اختيار التخصص' : 'Major Selection';
                                if (uc === 'career_change') return isAr ? 'تغيير المسار المهني' : 'Career Change';
                                if (uc === 'couples') return isAr ? 'توافق الشركاء' : 'Couples Compatibility';
                                if (uc === 'teams') return isAr ? 'ديناميكية الفريق' : 'Team Dynamics';
                                return uc;
                            };

                            return (
                                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-lg font-medium">
                                            {getUseCaseName(session.use_case)}
                                        </CardTitle>
                                        <Badge variant={isPaid ? "default" : isCompleted ? "secondary" : "outline"}>
                                            {isPaid
                                                ? (isAr ? "مدفوع" : "Paid")
                                                : isCompleted
                                                    ? (isAr ? "مكتمل" : "Completed")
                                                    : (isAr ? "قيد التنفيذ" : "In Progress")}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-muted-foreground mb-4">
                                            {new Date(session.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>

                                        {isPaid ? (
                                            <Link href={`/${lang}/results/${session.id}`}>
                                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                                    {isAr ? "عرض التقرير" : "View Report"}
                                                </Button>
                                            </Link>
                                        ) : isCompleted ? (
                                            <Link href={`/${lang}/results/${session.id}`}>
                                                <Button variant="secondary" className="w-full">
                                                    {isAr ? "فتح النتائج" : "Unlock Results"}
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href={`/${lang}/assessment/${session.use_case}?sessionId=${session.id}`}>
                                                <Button variant="outline" className="w-full">
                                                    {isAr ? "استكمال" : "Resume"}
                                                </Button>
                                            </Link>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
