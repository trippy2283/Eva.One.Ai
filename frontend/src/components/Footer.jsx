import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6 bg-[#030304]" data-testid="evaone-footer">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="font-bold text-base mb-1 tracking-tight">EvaOne</div>
          <div className="text-xs text-white/45 leading-relaxed">
            Built by <span className="text-white/70">Mentally Creative Studios</span>.<br/>
            The AI executive operating system.
          </div>
        </div>
        <div>
          <div className="label-eyebrow mb-3">PRODUCT</div>
          <ul className="space-y-1.5 text-xs text-white/55">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
            <li><Link to="/showcase" className="hover:text-white">Boardroom Showcase</Link></li>
          </ul>
        </div>
        <div>
          <div className="label-eyebrow mb-3">AI STACK</div>
          <ul className="space-y-1.5 text-xs text-white/55">
            <li>OpenAI</li>
            <li>Anthropic Claude</li>
            <li>Google Gemini</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/35 flex-wrap gap-2">
        <div>© 2026 Mentally Creative Studios · All rights reserved.</div>
        <div>EvaOne v1.4</div>
      </div>
    </footer>
  );
}
