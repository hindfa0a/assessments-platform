import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google"; // Changed Cairo to Tajawal
import { Header } from "@/components/layout/Header";

// ... inside RootLayout
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
