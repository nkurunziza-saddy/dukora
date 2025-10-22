"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Dukora
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <a
              href="#features"
              className="text-xs text-text-secondary hover:text-foreground transition"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-xs text-text-secondary hover:text-foreground transition"
            >
              About
            </a>
            <a
              href="#insights"
              className="text-xs text-text-secondary hover:text-foreground transition"
            >
              Insights
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/sign-up"
              className="px-4 py-1.5 text-xs font-medium text-foreground hover:bg-surface transition border border-border"
            >
              Sign up
            </Link>
          </div>

          <button
            className="md:hidden text-text-secondary hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XIcon className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-3">
              <Link
                href="#features"
                className="text-xs text-text-secondary hover:text-foreground transition"
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-xs text-text-secondary hover:text-foreground transition"
              >
                About
              </Link>
              <Link
                href="#insights"
                className="text-xs text-text-secondary hover:text-foreground transition"
              >
                Insights
              </Link>
              <div className="pt-3 border-t border-border">
                <Link
                  href="/auth/sign-up"
                  className="block px-4 py-1.5 text-xs font-medium text-center text-foreground border border-border hover:bg-surface transition"
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
}
