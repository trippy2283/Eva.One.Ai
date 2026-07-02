import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { EvaLogo } from "@/components/marketing/EvaLogo";

const NAV = [
  { label: "Platform", to: "/platform" },
  { label: "Solutions", to: "/solutions" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "Docs", to: "/docs" },
  { label: "Company", to: "/company" },
];

export function MarketingHeader() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "eva-glass-heavy border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <EvaLogo />

        <nav className="hidden lg:flex items-center gap-8 text-sm">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition-colors ${
                  isActive ? "text-white" : "text-white/65 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="btn-eva-outline rounded-lg px-5 py-2 text-sm font-medium"
            data-testid="launch-app-nav"
          >
            Launch App
          </button>
        </div>

        <button
          className="lg:hidden text-white/80 p-2 -mr-2"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden eva-glass-heavy border-t border-white/5 px-4 py-4">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-base ${
                    isActive ? "bg-white/5 text-white" : "text-white/70"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="btn-eva rounded-lg px-4 py-3 mt-2 text-base font-medium flex items-center justify-center gap-2"
            >
              Launch App <ArrowRight size={16} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
