import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Github, Youtube, BookOpen } from "lucide-react";
import { EvaLogo } from "@/components/marketing/EvaLogo";

const LINKS = [
  { label: "Platform", to: "/platform" },
  { label: "Solutions", to: "/solutions" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "Docs", to: "/docs" },
  { label: "Company", to: "/company" },
  { label: "Privacy", to: "/company#privacy" },
  { label: "Terms", to: "/company#terms" },
];

const SOCIAL = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Github, label: "GitHub", href: "https://github.com/M-C-Studios/Eva.One.Ai" },
  { icon: BookOpen, label: "Medium", href: "https://medium.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 pt-12 pb-8 px-4 sm:px-6" data-testid="eva-footer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <EvaLogo />

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60">
            {LINKS.map((l) => (
              <Link key={l.label} to={l.to} className="hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-violet-400/50 transition-colors"
              >
                <s.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center text-xs text-white/40 font-mono tracking-wider">
          © 2026 MentallyCreativeStudios.pco™ · All rights reserved.
        </div>
      </div>
    </footer>
  );
}
