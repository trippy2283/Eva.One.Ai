import React from "react";
import { motion } from "framer-motion";

/** Interior-page hero header. */
export function PageHero({ eyebrow, title, subtitle, children }) {
  return (
    <section className="relative px-4 sm:px-6 pt-16 pb-14 text-center overflow-hidden">
      <div className="eva-radial-purple absolute inset-0 pointer-events-none" />
      <div className="relative max-w-3xl mx-auto">
        {eyebrow && <div className="eva-eyebrow">{eyebrow}</div>}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-balance eva-text-gradient"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <p className="mt-5 text-base sm:text-lg text-white/60 leading-relaxed text-pretty">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8 flex flex-wrap gap-3 justify-center">{children}</div>}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={`${center ? "text-center mx-auto" : ""} max-w-2xl mb-12`}>
      {eyebrow && <div className="eva-eyebrow">{eyebrow}</div>}
      <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white text-balance">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-white/55 leading-relaxed text-pretty">{subtitle}</p>}
    </div>
  );
}

export function FeatureCard({ icon: Icon, title, body, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="eva-panel eva-panel-hover p-6"
    >
      {Icon && (
        <div className="w-12 h-12 rounded-xl eva-ring flex items-center justify-center mb-4">
          <Icon size={20} className="text-violet-200" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-white/55 leading-relaxed">{body}</p>
    </motion.div>
  );
}
