import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google"; // Changed Cairo to Tajawal
import { Header } from "@/components/layout/Header";
import "../globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Baseera",
    default: "Baseera | بصيرة",
  },
  description: "Saudi Arabia's Premier Personality Assessment Platform",
};

export async function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          tajawal.variable,
          lang === "ar" ? "font-tajawal" : "font-inter"
        )}
        suppressHydrationWarning
      >
        <Header lang={lang} />
        {children}
      </body>
    </html>
  );
}
