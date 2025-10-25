import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import * as routes from "@/utils/routes";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const locales = routing.locales;

function getPathWithoutLocale(pathname: string, locales: string[]) {
  const parts = pathname.split("/");
  if (parts.length > 1 && locales.includes(parts[1])) {
    return `/${parts.slice(2).join("/")}`;
  }
  return pathname;
}

export async function proxy(req: NextRequest) {
  const intlResponse = intlMiddleware(req);
  if (intlResponse) {
    return intlResponse;
  }

  const sessionCookie = getSessionCookie(req);
  const isLoggedIn = !!sessionCookie;

  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const pathWithoutLocale = getPathWithoutLocale(pathname, locales);

  if (isApiAuthRoute(pathname)) {
    return NextResponse.next();
  }

  if (isAuthRoute(pathWithoutLocale)) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(routes.DEFAULT_AUTH_REDIRECT, nextUrl),
      );
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute(pathWithoutLocale)) {
    return NextResponse.redirect(new URL(routes.authRoutes[0], nextUrl));
  }

  return NextResponse.next();
}

function isApiAuthRoute(pathname: string) {
  return pathname.startsWith(routes.apiAuthPrefix);
}

function isPublicRoute(pathname: string) {
  return routes.publicRoutes.includes(pathname);
}

function isAuthRoute(pathname: string) {
  return routes.authRoutes.includes(pathname);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
