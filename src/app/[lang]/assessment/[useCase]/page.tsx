import { notFound } from "next/navigation";
import { USE_CASES } from "@/lib/assessments/data";
import { UseCaseManager } from "@/components/assessment/UseCaseManager";

interface PageProps {
    params: Promise<{
        lang: string;
        useCase: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AssessmentPage({ params, searchParams }: PageProps) {
    const { lang, useCase: useCaseId } = await params;

    // MANDATORY AUTH CHECK
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const { redirect } = await import("next/navigation");
        redirect(`/${lang}/login?next=/${lang}/assessment/${useCaseId}`);
    }

    // Extract sessionId if present (for join flow)
    const { sessionId } = await searchParams;
    const resolvedSessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;

    const useCaseConfig = USE_CASES[useCaseId];

    if (!useCaseConfig) {
        notFound();
    }

    return <UseCaseManager useCase={useCaseConfig} lang={lang} sessionId={resolvedSessionId} />;
}
