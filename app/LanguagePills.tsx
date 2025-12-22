"use client";

import { type Lang } from "@/lib/i18n";

export default function LanguagePills({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const items: Array<{ key: Lang; label: string }> = [
    { key: "en", label: "EN" },
    { key: "zh", label: "中" },
    { key: "ar", label: "AR" },
  ];

  return (
    <div className="inline-flex items-center rounded-2xl border border-white/12 bg-white/6 p-1 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
      {items.map((x) => {
        const active = x.key === lang;
        return (
          <button
            key={x.key}
            type="button"
            onClick={() => setLang(x.key)}
            className={[
              "relative px-3 py-2 text-xs font-semibold rounded-xl transition-all",
              "min-w-[44px]",
              active
                ? "text-white"
                : "text-white/65 hover:text-white/90 hover:bg-white/8",
            ].join(" ")}
          >
            {active && (
              <span
                className={[
                  "absolute inset-0 rounded-xl",
                  "bg-gradient-to-r from-indigo-500/55 via-cyan-500/40 to-fuchsia-500/35",
                  "shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_0_30px_rgba(120,102,255,0.25)]",
                ].join(" ")}
              />
            )}
            <span className="relative flex items-center justify-center gap-2">
              {x.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
