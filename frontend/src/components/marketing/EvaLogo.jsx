import React from "react";
import { Link } from "react-router-dom";

/**
 * EVA ONE brand lockup: circular gradient ring + wordmark.
 */
export function EvaLogo({ size = 34, to = "/", className = "" }) {
  return (
    <Link to={to} className={`flex items-center gap-3 group ${className}`} aria-label="EVA ONE home">
      <span
        className="relative inline-flex items-center justify-center rounded-full"
        style={{ width: size, height: size }}
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 180deg, #7c3aed, #4f46e5, #22d3ee, #ec4899, #7c3aed)",
            padding: 3,
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <span
          className="rounded-full"
          style={{
            width: size * 0.34,
            height: size * 0.34,
            background: "linear-gradient(135deg,#a78bfa,#22d3ee)",
            boxShadow: "0 0 14px rgba(124,92,255,0.8)",
          }}
        />
      </span>
      <span className="text-lg font-semibold tracking-[0.15em] eva-wordmark">
        EVA ONE
      </span>
    </Link>
  );
}
