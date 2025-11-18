"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("landing.footer");
  return (
    <footer className="border-t border-border bg-background" id="contact">
      <div className="pgtx py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-foreground">
                Dukora
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-2">
              <Link
                aria-label="X (Twitter)"
                className="w-8 h-8 border border-border hover:bg-surface flex items-center justify-center transition"
                href="https://x.com/nk_saddy"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  className="w-3.5 h-3.5 text-text-secondary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>X (Twitter)</title>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                aria-label="GitHub"
                className="w-8 h-8 border border-border hover:bg-surface flex items-center justify-center transition"
                href="https://github.com/nkurunziza-saddy/dukora"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg
                  className="w-3.5 h-3.5 text-text-secondary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>GitHub</title>
                  <path
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    fillRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              {t("product")}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="#features"
                >
                  {t("featuresLink")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="https://github.com/nkurunziza-saddy/dukora"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t("githubLink")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="https://github.com/nkurunziza-saddy/dukora/blob/main/LICENSE"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t("licenseLink")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              {t("resources")}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="#insights"
                >
                  {t("insightsLink")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="#about"
                >
                  {t("aboutLink")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="https://github.com/nkurunziza-saddy/dukora/issues"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t("reportIssueLink")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-tertiary">{t("copyright")}</p>
          <div className="flex items-center gap-4">
            <Link
              className="text-xs text-text-tertiary hover:text-text-secondary transition"
              href="https://github.com/nkurunziza-saddy/dukora"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("contribute")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
