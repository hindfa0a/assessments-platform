"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart } from "lucide-react";

interface TeamReportProps {
    sessionId: string;
    lang: string;
    members?: any[]; // For aggregated data
}

export function TeamReport({ sessionId, lang, members = [] }: TeamReportProps) {
    const isAr = lang === 'ar';

    // Mock calculations or use simplified aggregations
    // e.g., Count MBTI types
    const types: Record<string, number> = {};
    const strengthsAgg: Record<string, number> = {};

    members.forEach(m => {
        // MBTI
        const type = m.mbti_type || "Unknown";
        if (type !== "Unknown") types[type] = (types[type] || 0) + 1;

        // Strengths
        if (m.strengths_scores) {
            // Sort individual strengths to get top 3 for this member
            const memberTop3 = Object.entries(m.strengths_scores as Record<string, number>)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([k]) => k);

            // Add weight to team aggregation
            memberTop3.forEach(s => {
                strengthsAgg[s] = (strengthsAgg[s] || 0) + 1;
            });
        }
    });

    const topStrengths = Object.entries(strengthsAgg)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([k]) => k);

    return (
        <Card className="mt-8 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-indigo-700">
                    <Users className="w-6 h-6" />
                    {isAr ? "تحليل ديناميكيات الفريق" : "Team Dynamics Report"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Distribution Mock */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <BarChart className="w-4 h-4 text-indigo-600" />
                            {isAr ? "توزيع الشخصيات" : "Personality Distribution"}
                        </h3>
                        {/* We keep MBTI distribution as it's useful and likely working or can be mocked if needed. 
                            Let's just show simple breakdown. 
                        */}
                        <div className="space-y-3">
                            {Object.entries(types).map(([type, count]) => (
                                <div key={type} className="flex justify-between items-center text-sm">
                                    <span className="font-medium">{type}</span>
                                    <span className="text-muted-foreground">{Math.round((count / members.length) * 100)}%</span>
                                </div>
                            ))}
                            {members.length === 0 && <p className="text-muted-foreground text-sm">{isAr ? "لا يوجد أعضاء بعد" : "No members yet"}</p>}
                        </div>
                    </div>

                    {/* Team Strength - REAL LOGIC */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold mb-4">
                            {isAr ? "نقاط القوة الجماعية" : "Collective Strengths"}
                        </h3>
                        {topStrengths.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                {topStrengths.map(s => (
                                    <li key={s}>{s}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-sm italic">{isAr ? "بانتظار البيانات..." : "Waiting for data..."}</p>
                        )}
                    </div>
                </div>

                <div className="bg-white/50 p-6 rounded-xl border border-indigo-100">
                    <p className="text-muted-foreground leading-relaxed text-center italic">
                        {isAr
                            ? "يتمتع هذا الفريق بتوازن جيد بين التخطيط والتنفيذ، مما يجعله مثالياً للمشاريع المعقدة."
                            : "This team possesses a good balance between planning and execution, making it ideal for complex projects."
                        }
                    </p>
                </div>

            </CardContent>
        </Card>
    );
}
