"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Copy, Check, Lock, Crown, User, RefreshCw } from "lucide-react";
import { getCoupleWhatsAppLink } from "@/lib/couples"; // Reuse or make generic
import { PaymentModal } from "@/components/payment/PaymentModal";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
    id: string;
    participant_name: string;
    status: string;
    participant_role: string;
}

interface TeamDashboardProps {
    sessionId: string;
    shareCode: string;
    lang: string;
    teamName: string;
    isLeader: boolean;
    members: TeamMember[];
    isReadyForAnalysis: boolean;
    isPaid: boolean;
}

export function TeamDashboard({
    sessionId,
    shareCode,
    lang,
    teamName,
    isLeader,
    members,
    isReadyForAnalysis,
    isPaid
}: TeamDashboardProps) {
    const isAr = lang === 'ar';
    const [copied, setCopied] = useState(false);

    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://baseera.sa'}/${lang}/join/${shareCode}`;
    // Todo: generic whatsapp link
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(isAr
        ? `🔥 انضم لفريقي "${teamName}" في تحليل بصيرة!\nرابط الانضمام: ${shareUrl}\nالرمز: ${shareCode}`
        : `🔥 Join my team "${teamName}" on Baseera!\nLink: ${shareUrl}\nCode: ${shareCode}`)}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 1. If Paid -> Show Unlock Success
    if (isPaid) {
        return (
            <div className="text-center p-8 bg-indigo-50 rounded-lg border border-indigo-200 mb-8">
                <h2 className="text-xl font-bold text-indigo-800 mb-2">
                    {isAr ? "تم فتح تقرير الفريق!" : "Team Report Unlocked!"}
                </h2>
                <p>{isAr ? "يمكنكم الآن استعراض ديناميكيات الفريق." : "You can now view team dynamics below."}</p>
            </div>
        );
    }

    // 2. Dashboard
    return (
        <Card className="max-w-3xl mx-auto border-0 shadow-2xl bg-white mb-8 overflow-hidden rounded-2xl">
            <div className="h-3 w-full bg-gradient-to-r from-brand-indigo to-brand-cyan"></div>
            <CardHeader className="pb-4 pt-8 px-8">
                <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-indigo/10 p-2 rounded-lg">
                            <Users className="w-6 h-6 text-brand-indigo" />
                        </div>
                        <span className={`text-2xl font-bold ${isAr ? 'font-tajawal' : 'font-inter'}`}>{teamName}</span>
                    </div>
                    {isLeader && <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1">
                        <Crown className="w-3 h-3 mr-1" />
                        {isAr ? "قائد الفريق" : "Team Leader"}
                    </Badge>}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-10">

                {/* Share Section (Only Leader usually, but maybe members want to invite?) */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex flex-col gap-2 w-full">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{isAr ? "رمز الفريق" : "Team Code"}</span>
                        <div className="flex items-center gap-3">
                            <code className="text-3xl font-mono font-bold text-slate-800">{shareCode}</code>
                            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white hover:text-brand-indigo" onClick={copyToClipboard}>
                                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                    <Button asChild size="lg" className="w-full md:w-auto bg-[#25D366] hover:bg-[#128C7E] font-bold shadow-md shadow-green-500/10">
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            {isAr ? "دعوة عبر واتساب" : "Invite via WhatsApp"}
                        </a>
                    </Button>
                </div>

                {/* Members List */}
                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                        <User className="w-5 h-5 text-slate-400" />
                        {isAr ? `الأعضاء (${members.length})` : `Members (${members.length})`}
                    </h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                        {members.map(member => (
                            <div key={member.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ring-4 ring-white shadow-sm ${member.status === 'completed' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                    <span className="font-semibold text-slate-700 text-lg">{member.participant_name || 'Anonymous'}</span>
                                    {member.participant_role === 'leader' && <Crown className="w-4 h-4 text-amber-500" />}
                                </div>
                                <Badge variant={member.status === 'completed' ? 'default' : 'outline'} className={`px-3 py-1 ${member.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'text-slate-500'}`}>
                                    {member.status === 'completed'
                                        ? (isAr ? 'مكتمل' : 'Completed')
                                        : (isAr ? 'جاري العمل' : 'In Progress')}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status/Action Area */}
                {isLeader ? (
                    <div className="pt-6 border-t border-slate-50">
                        {!isReadyForAnalysis ? (
                            <div className="flex items-center justify-center gap-2 text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <Lock className="w-4 h-4" />
                                <span className="font-medium">{isAr ? "يجب اكتمال 3 أعضاء على الأقل لفتح التقرير" : "Need 3+ completed members to unlock report"}</span>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <p className="text-green-600 font-bold flex items-center justify-center gap-2">
                                    <Check className="w-5 h-5" />
                                    {isAr ? "الفريق جاهز للتحليل!" : "Team is ready for analysis!"}
                                </p>
                                <PaymentModal
                                    sessionId={sessionId}
                                    lang={lang}
                                    price={50}
                                    title={isAr ? "فتح تقرير الفريق" : "Unlock Team Report"}
                                    useCaseName="Team Dynamics"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="pt-6 border-t border-slate-50 text-center text-slate-400">
                        <p className="flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4" />
                            {isAr ? "في انتظار القائد لفتح التقرير..." : "Waiting for leader to unlock report..."}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
