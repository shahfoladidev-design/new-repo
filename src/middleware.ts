import createMiddleware from "next-intl/middleware";
import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";
import { defaultLocale, locales, type Locale } from "./i18n/config";
import { assertSupabasePublicEnv, publicSupabaseEnv } from "./lib/env";
import { isAdminUser } from "./lib/admin/is-admin-user";

const intlMiddleware = createMiddleware(routing);

function localeFromPathname(pathname: string): Locale {
  const match = pathname.match(/^\/(en|dari|ps)(?=\/|$)/);
  if (match && locales.includes(match[1] as Locale)) {
    return match[1] as Locale;
  }
  return defaultLocale;
}

function withSiteLocale(request: NextRequest, locale: Locale) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-locale", locale);
  return new NextRequest(request.url, { headers: requestHeaders });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    assertSupabasePublicEnv();

    let response = NextResponse.next({
      request: withSiteLocale(request, defaultLocale),
    });

    const supabase = createServerClient(publicSupabaseEnv.supabaseUrl, publicSupabaseEnv.supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: withSiteLocale(request, defaultLocale),
          });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const publicAdminPaths = new Set([
      "/admin/login",
      "/admin/forgot-password",
      "/admin/reset-password",
    ]);

    if (publicAdminPaths.has(pathname)) {
      if (user && (await isAdminUser(supabase, user.id)) && pathname !== "/admin/reset-password") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return response;
    }

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (!(await isAdminUser(supabase, user.id))) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url));
    }

    return response;
  }

  const locale = localeFromPathname(pathname);
  return intlMiddleware(withSiteLocale(request, locale));
}

export const config = {
  matcher: ["/", "/(en|dari|ps)/:path*", "/admin", "/admin/:path*"],
};
