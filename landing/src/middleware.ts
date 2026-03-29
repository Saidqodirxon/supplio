import { NextResponse, NextRequest } from "next/server";
import { languageSlugs } from "./i18n/translations";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Root redirect to /uz (default)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/uz", request.url));
  }

  // 2. Already has a valid language prefix or is an asset
  const pathnameIsMissingValidLocale = Object.keys(languageSlugs).every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // We should also check if it's not a public asset
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/api");

  if (pathnameIsMissingValidLocale && !isPublicAsset) {
    return NextResponse.redirect(new URL("/uz", request.url));
  }
} 


export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|api|favicon.ico).*)",
  ],
};
