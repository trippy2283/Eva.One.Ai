import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6 bg-[#030304]" data-testid="evaone-footer">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-sm">
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
            <li><a href="/" className="hover:text-white">Eva Chat</a></li>
            <li><a href="/" className="hover:text-white">AI Boardroom</a></li>
            <li><a href="/" className="hover:text-white">Knowledge Vault</a></li>
            <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
          </ul>
        </div>
        <div>
          <div className="label-eyebrow mb-3">POWERED BY</div>
          <ul className="space-y-1.5 text-xs text-white/55">
            <li>OpenAI</li>
            <li>Anthropic</li>
            <li>Google Gemini</li>
            <li>Emergent</li>
          </ul>
        </div>
        <div>
          <div className="label-eyebrow mb-3">LEGAL</div>
          <ul className="space-y-1.5 text-xs text-white/55">
            <li><a href="#" className="hover:text-white">Terms</a></li>
            <li><a href="#" className="hover:text-white">Privacy</a></li>
            <li><a href="#" className="hover:text-white">Security</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/35">
        <div>© 2026 Mentally Creative Studios · All rights reserved.</div>
        <div>EvaOne v1.3</div>
      </div>
    </footer>
  );
}
