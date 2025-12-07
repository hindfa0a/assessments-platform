import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const locales = ["ar", "en"];
const defaultLocale = "ar";

export async function middleware(request: NextRequest) {
    // 1. Handle i18n redirection logic
    const { pathname } = request.nextUrl;

    // Check if there is any supported locale in the pathname
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    let response: NextResponse | undefined;

    if (!pathnameHasLocale) {
        // Redirect if there is no locale
        const locale = defaultLocale;
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}${pathname}`;
        response = NextResponse.redirect(url);
    } else {
        // Continue with the request
        response = NextResponse.next();
    }

    // 2. Refresh Supabase session (must run on the response)
    // We pass the response we created (either redirect or next)
    return await updateSession(request, response);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        "/((?!_next|favicon.ico|api|static|auth|.*\\..*).*)",
    ],
};
