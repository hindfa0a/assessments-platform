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
    members.forEach(m => {
        // Assume we fetch or have mbti_type in member object
        // For MVP, we use mock if not present
        const type = m.mbti_type || "Unknown";
        types[type] = (types[type] || 0) + 1;
    });

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
                        <div className="space-y-2">
                            {/* Placeholder Visualization */}
                            <div className="flex justify-between items-center">
                                <span>Strategists (NT)</span>
                                <div className="w-1/2 bg-gray-100 rounded-full h-2">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Diplomats (NF)</span>
                                <div className="w-1/2 bg-gray-100 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Sentinels (SJ)</span>
                                <div className="w-1/2 bg-gray-100 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Strength */}
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-bold mb-4">
                            {isAr ? "نقاط القوة الجماعية" : "Collective Strengths"}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            <li>High Strategic Planning</li>
                            <li>Strong Execution Capability</li>
                            <li>Creative Problem Solving</li>
                        </ul>
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
