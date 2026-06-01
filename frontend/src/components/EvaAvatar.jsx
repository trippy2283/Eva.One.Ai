import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const STATE_IMAGES = {
  idle: "https://static.prod-images.emergentagent.com/jobs/45787ca7-ff54-4dfd-b80d-271cf6f40729/images/d209384f8f582cfd8a09ff3a082bbc2aaf53b1f2c8b0258e5311ea51bf9b7cc7.png",
  listening: "https://static.prod-images.emergentagent.com/jobs/45787ca7-ff54-4dfd-b80d-271cf6f40729/images/3967ed1ac36255cda09d646533d250d43bacf0c4cfa7646ff254a1ee55f66dc0.png",
  speaking: "https://static.prod-images.emergentagent.com/jobs/45787ca7-ff54-4dfd-b80d-271cf6f40729/images/f6227e62163982e07de52907f0194a3b8da25de389aa64b2e266d6e2303a21cd.png",
  thinking: "https://static.prod-images.emergentagent.com/jobs/45787ca7-ff54-4dfd-b80d-271cf6f40729/images/95cf2cb9370384de0b0a289c416dcd84b6f461ec8247eb034a7852ba885283ba.png",
};

const STATE_GLOW = {
  idle: "rgba(0, 240, 255, 0.18)",
  listening: "rgba(0, 240, 255, 0.55)",
  speaking: "rgba(0, 240, 255, 0.65)",
  thinking: "rgba(138, 43, 226, 0.55)",
};

const STATE_LABEL = {
  idle: "STANDBY",
  listening: "LISTENING",
  speaking: "SPEAKING",
  thinking: "PROCESSING",
};

/**
 * Eva intelligent avatar.
 * Props: state = idle | listening | speaking | thinking, size in px, showLabel.
 */
export function EvaAvatar({ state = "idle", size = 180, showLabel = true }) {
  const src = STATE_IMAGES[state] || STATE_IMAGES.idle;
  const glow = STATE_GLOW[state] || STATE_GLOW.idle;
  return (
    <div className="flex flex-col items-center gap-3" data-testid={`eva-avatar-${state}`}>
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 ${size * 0.4}px ${glow}, inset 0 0 ${size * 0.2}px rgba(0,0,0,0.4)`,
          transition: "box-shadow 0.6s ease",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={state}
            src={src}
            alt={`Eva ${state}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className={`w-full h-full rounded-full object-cover eva-avatar-${state}`}
            draggable={false}
          />
        </AnimatePresence>

        {/* Ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: `1px solid ${state === "thinking" ? "rgba(138,43,226,0.45)" : "rgba(0,240,255,0.35)"}`,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center gap-2">
          <span
            className="cyan-dot"
            style={{
              background: state === "thinking" ? "#8A2BE2" : "#00F0FF",
              boxShadow: `0 0 10px ${state === "thinking" ? "#8A2BE2" : "#00F0FF"}`,
            }}
          />
          <span className="label-eyebrow">{STATE_LABEL[state]}</span>
        </div>
      )}
    </div>
  );
}
