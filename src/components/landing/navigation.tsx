"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function Navigation() {
  const t = useTranslations("landing.navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {t("brand")}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              className="text-xs text-text-secondary hover:text-foreground transition"
              href="#features"
            >
              {t("features")}
            </Link>
            <Link
              className="text-xs text-text-secondary hover:text-foreground transition"
              href="#about"
            >
              {t("about")}
            </Link>
            <Link
              className="text-xs text-text-secondary hover:text-foreground transition"
              href="#insights"
            >
              {t("insights")}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              className="px-4 py-1.5 text-xs font-medium text-foreground hover:bg-surface transition border border-border"
              href="/auth/sign-up"
            >
              {t("signUp")}
            </Link>
          </div>

          <button
            className="md:hidden text-text-secondary hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
          >
            {mobileMenuOpen ? (
              <XIcon className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="md:hidden">
          <div
            aria-hidden={!mobileMenuOpen}
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="py-4 border-t border-border">
              <nav className="flex flex-col gap-3">
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="#features"
                >
                  {t("features")}
                </Link>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="#about"
                >
                  {t("about")}
                </Link>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="#insights"
                >
                  {t("insights")}
                </Link>
                <div className="pt-3 border-t border-border">
                  <Link
                    className="block px-4 py-1.5 text-xs font-medium text-center text-foreground border border-border hover:bg-surface transition"
                    href="/auth/sign-up"
                  >
                    {t("signUp")}
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
