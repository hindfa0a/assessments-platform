import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, GraduationCap, Briefcase, Heart, Users, Check } from "lucide-react";
import Image from "next/image";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isAr = lang === "ar";
  const dir = isAr ? "rtl" : "ltr";

  // Content Dictionary
  const content = {
    hero: {
      title: isAr ? "اكتشف إمكاناتك الحقيقية" : "Discover Your True Potential",
      subtitle: isAr
        ? "منصة بصيرة للتقييم الشامل تساعدك في اتخاذ قرارات مدروسة لمستقبلك المهني والشخصي."
        : "Baseera's comprehensive assessment platform helps you make informed decisions for your career and personal life.",
      cta: isAr ? "ابدأ التقييم الآن" : "Start Assessment Now",
    },
    cards: [
      {
        id: "major_selection",
        title: isAr ? "اختيار التخصص الجامعي" : "University Major Selection",
        description: isAr
          ? "تحليل شامل لميولك وقدراتك لمساعدتك في اختيار التخصص الأنسب."
          : "Comprehensive analysis of your interests and abilities to choose the best major.",
        price: "10",
        icon: GraduationCap,
        features: isAr ? ["اختبار MBTI", "اختبار هولندا", "تقرير بالذكاء الاصطناعي"] : ["MBTI Test", "Holland Code", "AI Report"],
        gradient: "from-blue-500 to-cyan-500", // Blue/Cyan
        href: "/assessment/major_selection"
      },
      {
        id: "career_change",
        title: isAr ? "تغيير المسار المهني" : "Career Change",
        description: isAr
          ? "أعد اكتشف نفسك وحدد الوظيفة التي تناسب شغفك وقيمك."
          : "Rediscover yourself and identify the career that fits your passion and values.",
        price: "10",
        icon: Briefcase,
        features: isAr ? ["الصفات الخمس (Big 5)", "قيم العمل", "تحليل الفجوة"] : ["Big Five Traits", "Work Values", "Gap Analysis"],
        gradient: "from-purple-500 to-pink-500", // Purple/Pink
        href: "/assessment/career_change"
      },
      {
        id: "couples",
        title: isAr ? "التوافق بين الشريكين" : "Couples Compatibility",
        description: isAr
          ? "افهم شريكك بشكل أعمق وتعرف على نقاط القوة والتحديات في علاقتكما."
          : "Understand your partner deeply and identify strengths and challenges in your relationship.",
        price: "20",
        icon: Heart,
        features: isAr ? ["لغات الحب", "أنماط التعلق", "تحليل التوافق"] : ["Love Languages", "Attachment Styles", "Compatibility Analysis"],
        gradient: "from-rose-500 to-orange-500", // Rose/Orange
        href: "/assessment/couples"
      },
      {
        id: "teams",
        title: isAr ? "ديناميكيات الفريق" : "Team Dynamics",
        description: isAr
          ? "قم ببناء فرق عمل متناغمة وفعالة من خلال فهم شخصيات الأعضاء."
          : "Build harmonious and effectives teams by understanding member personalities.",
        price: "50",
        icon: Users,
        features: isAr ? ["تحليل نقاط القوة", "أساليب النزاع", "خريطة الفريق"] : ["Strengths Analysis", "Conflict Styles", "Team Map"],
        gradient: "from-emerald-500 to-teal-500", // Emerald/Teal
        href: "/assessment/teams"
      }
    ]
  };

  return (
    <div className={`min-h-screen bg-white ${isAr ? "font-tajawal" : "font-inter"}`} dir={dir}>
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo Placeholder - Matches mybaseera style */}
            <div className="text-2xl font-bold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent">
              {isAr ? "بصيرة" : "Baseera"}
            </div>
            <span className="px-2 py-0.5 text-xs font-medium bg-brand-indigo/10 text-brand-indigo rounded-full">
              {isAr ? "التقييمات" : "Assessments"}
            </span>
          </div>
          <div className="flex gap-4">
            <Link href={isAr ? "/en" : "/ar"} className="text-sm font-medium text-gray-600 hover:text-brand-indigo transition-colors">
              {isAr ? "English" : "العربية"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-indigo/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#111827] mb-6 leading-tight">
            {content.hero.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {content.hero.subtitle}
          </p>
          <Button size="lg" className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 text-white shadow-lg shadow-brand-indigo/25 text-lg px-8 py-6 rounded-full transition-all hover:scale-105">
            {content.hero.cta}
          </Button>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.cards.map((card) => (
              <Card key={card.id} className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white flex flex-col">
                {/* Top Gradient Bar */}
                <div className={`h-2 w-full bg-gradient-to-r ${card.gradient}`}></div>

                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-brand-indigo transition-colors leading-snug min-h-[3.5rem]">
                    {card.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 flex-grow">
                  <p className="text-sm text-gray-500 leading-relaxed min-h-[3rem]">
                    {card.description}
                  </p>
                  <div className="space-y-2">
                    {card.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-600">
                        <Check className="w-3 h-3 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-gray-50 bg-gray-50/50">
                  <div className="w-full flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium">{isAr ? "سعر التقرير" : "Report Price"}</span>
                      <span className="text-lg font-bold text-gray-900">{card.price} {isAr ? "ر.س" : "SAR"}</span>
                    </div>
                    <Button asChild size="sm" className={`rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-brand-indigo shadow-sm hover:border-brand-indigo/30`}>
                      <Link href={`/${lang}${card.href}`}>
                        {isAr ? "ابدأ" : "Start"}
                        {isAr ? <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> : <ArrowRight className="w-4 h-4 ml-1" />}
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="#" className="hover:text-brand-indigo transition-colors">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</Link>
            <Link href="#" className="hover:text-brand-indigo transition-colors">{isAr ? "شروط الاستخدام" : "Terms of Service"}</Link>
            <Link href="#" className="hover:text-brand-indigo transition-colors">{isAr ? "اتصل بنا" : "Contact Us"}</Link>
          </div>
          <p>© {new Date().getFullYear()} {isAr ? "بصيرة. جميع الحقوق محفوظة." : "Baseera. All rights reserved."}</p>
        </div>
      </footer>
    </div>
  );
}
