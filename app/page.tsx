"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  Wand2,
  Share2,
  Settings,
  Plus,
  RefreshCcw,
  Globe,
  Radar,
  Clock,
  Stars,
  LayoutDashboard,
  Command,
  Pin,
  Flame,
  Hash,
  User,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * Highest-end "World" page
 * - Next.js + Tailwind
 * - Framer Motion for premium motion
 * - Recharts for tiny dashboard charts
 *
 * You can later wire real API data to replace mocked data.
 */

type RecordItem = {
  id: string;
  day: number;
  title: string;
  body: string;
  author: string;
  ts: string;
  heat: number; // 0-100
  tags: string[];
};

type ViewMode = "chrono" | "constellation";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function useHotkeys(onCommand: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmdk = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k";
      if (cmdk) {
        e.preventDefault();
        onCommand();
      }
      if (e.key === "Escape") onCommand(); // toggles close if open; fine for MVP
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCommand]);
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function formatUTC(ts: string) {
  // keep simple
  return ts.replace("T", " ").replace("Z", " UTC");
}

function pseudoHeatmap(days = 21) {
  // GitHub-like blocks
  const arr = Array.from({ length: days }, (_, i) => ({
    d: i + 1,
    v: Math.floor(Math.pow(Math.random(), 0.7) * 8),
  }));
  return arr;
}

function genMockRecords(): RecordItem[] {
  const authors = ["Founder", "Tester", "Observer", "Archivist"];
  const tagsPool = ["truth", "rule", "genesis", "memory", "signal", "warning", "future"];
  const now = Date.now();

  return Array.from({ length: 18 }).map((_, idx) => {
    const day = idx < 3 ? 0 : Math.floor(idx / 2);
    const author = authors[idx % authors.length];
    const heat = clamp(Math.floor(Math.random() * 110), 10, 100);
    const tags = Array.from({ length: 2 + (idx % 2) }, () => tagsPool[Math.floor(Math.random() * tagsPool.length)]);
    const titleCandidates = [
      "Genesis — the first irreversible mark.",
      "We once began from this very moment.",
      "A rule that survived the night.",
      "Signal detected beyond the usual noise.",
      "Write something that outlives the timeline.",
      "The world remembers. You don't need to.",
      "If it matters, make it irreversible.",
    ];
    const bodyCandidates = [
      "This is not a note. It’s a trace.",
      "You can’t undo reality. You can only design it.",
      "Truth is the only compounding asset that never decays.",
      "Write like the world is watching. Because it is.",
      "Systems are memories with teeth.",
    ];

    const ts = new Date(now - idx * 1000 * 60 * (20 + Math.random() * 50)).toISOString().replace(".000", "");
    return {
      id: `r_${idx}_${Math.random().toString(16).slice(2)}`,
      day,
      title: titleCandidates[idx % titleCandidates.length],
      body: bodyCandidates[idx % bodyCandidates.length],
      author,
      ts,
      heat,
      tags,
    };
  });
}

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = display;
    const end = value;
    const t0 = performance.now();
    const dur = 700;
    let raf = 0;

    const tick = (t: number) => {
      const p = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

function Pill({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
      {icon}
      {children}
    </span>
  );
}

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent" />
      {children}
    </div>
  );
}

function AmbientBackground() {
  // lightweight: gradient + noise overlay + moving glow
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_20%_10%,rgba(120,102,255,0.18),transparent_60%),radial-gradient(900px_600px_at_80%_20%,rgba(0,210,255,0.12),transparent_55%),radial-gradient(900px_600px_at_50%_90%,rgba(255,0,160,0.08),transparent_55%)]" />
      <motion.div
        className="absolute -inset-40 opacity-40"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "conic-gradient(from 180deg, rgba(255,255,255,0.0), rgba(120,102,255,0.16), rgba(0,210,255,0.10), rgba(255,0,160,0.08), rgba(255,255,255,0.0))",
          filter: "blur(70px)",
        }}
      />
      {/* Noise */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 26 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/30"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.5,
              scale: 0.6 + Math.random() * 1.2,
            }}
            animate={{
              y: ["0%", "-12%"],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 4,
            }}
            style={{ transform: "translateZ(0)" }}
          />
        ))}
      </div>
    </div>
  );
}

function WorldPulseBar({ label }: { label: string }) {
  return (
    <div className="relative w-[260px] overflow-hidden rounded-full border border-white/10 bg-white/5 px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-white/80">
        <Radar className="h-3.5 w-3.5 text-white/70" />
        <span className="truncate">{label}</span>
      </div>
      <motion.div
        className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ["-30%", "140%"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function CommandPalette({
  open,
  onClose,
  records,
  onJump,
  onNew,
}: {
  open: boolean;
  onClose: () => void;
  records: RecordItem[];
  onJump: (id: string) => void;
  onNew: () => void;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const items = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const base = records
      .filter((r) => {
        if (!qq) return true;
        return (
          r.title.toLowerCase().includes(qq) ||
          r.body.toLowerCase().includes(qq) ||
          r.author.toLowerCase().includes(qq) ||
          r.tags.some((t) => t.toLowerCase().includes(qq))
        );
      })
      .slice(0, 8);

    return base;
  }, [q, records]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="w-full max-w-2xl"
            initial={{ y: 12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GlassCard className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
                <Command className="h-4 w-4 text-white/70" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search records, authors, tags…"
                  className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/35 outline-none"
                />
                <kbd className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-white/60">
                  ESC
                </kbd>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    onNew();
                    onClose();
                  }}
                  className="mb-2 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-white/85 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-white/70" />
                    <span>New record</span>
                  </div>
                  <span className="text-xs text-white/45">Enter</span>
                </button>

                <div className="space-y-1">
                  {items.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onJump(r.id);
                        onClose();
                      }}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/[0.06]"
                    >
                      <div className="mt-0.5 h-2 w-2 rounded-full bg-white/50" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white/90">{r.title}</span>
                          <span className="text-xs text-white/40">Day {r.day}</span>
                        </div>
                        <div className="line-clamp-1 text-xs text-white/50">{r.body}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {r.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60"
                            >
                              <Hash className="h-3 w-3" />
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-white/35">{r.author}</div>
                    </button>
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-6 text-center text-sm text-white/50">
                      No results.
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SliderConfirm({
  onConfirm,
  disabled,
  label = "Slide to seal (irreversible)",
}: {
  onConfirm: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const [x, setX] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);

  const maxX = () => {
    const track = trackRef.current;
    const handle = handleRef.current;
    if (!track || !handle) return 260;
    return Math.max(0, track.clientWidth - handle.clientWidth);
  };

  useEffect(() => {
    setX(0);
  }, [disabled]);

  return (
    <div className={cn("select-none", disabled && "opacity-60")}>
      <div
        ref={trackRef}
        className="relative h-12 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05]"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[rgba(120,102,255,0.25)] via-[rgba(0,210,255,0.18)] to-[rgba(255,0,160,0.14)]"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white/75">
          {label}
        </div>

        <motion.div
          ref={handleRef}
          className="absolute left-1 top-1 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/40 backdrop-blur"
          drag={disabled ? false : "x"}
          dragConstraints={{ left: 0, right: maxX() }}
          dragElastic={0}
          onDrag={(e, info) => setX(info.point.x)}
          onDragEnd={(e, info) => {
            const right = maxX();
            if (info.offset.x >= right * 0.82) {
              onConfirm();
              setX(0);
            } else {
              setX(0);
            }
          }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        >
          <CheckCircle2 className="h-5 w-5 text-white/80" />
        </motion.div>
      </div>
      <div className="mt-2 text-[11px] text-white/45">
        Tip: ⌘/Ctrl + K opens command palette.
      </div>
    </div>
  );
}

function RecordCard({
  r,
  onOpen,
  pinned,
  onPin,
}: {
  r: RecordItem;
  onOpen: (r: RecordItem) => void;
  pinned: boolean;
  onPin: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.055]"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-white/10 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Day {r.day}
            </span>
            <span>·</span>
            <span>{formatUTC(r.ts)}</span>
          </div>
          <div className="mt-2 text-[15px] font-semibold leading-snug text-white/90">
            {r.title}
          </div>
        </div>
        <button
          onClick={() => onPin(r.id)}
          className={cn(
            "rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-white/70 hover:bg-white/10",
            pinned && "border-white/20 bg-white/10 text-white"
          )}
          title="Pin"
        >
          <Pin className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 line-clamp-2 text-sm text-white/60">{r.body}</div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/65">
          <User className="h-3 w-3" />
          {r.author}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/65">
          <Flame className="h-3 w-3" />
          Heat {r.heat}
        </span>
        {r.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60"
          >
            <Hash className="h-3 w-3" />
            {t}
          </span>
        ))}
        <button
          onClick={() => onOpen(r)}
          className="ml-auto rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
        >
          Open
        </button>
      </div>
    </motion.div>
  );
}

function DetailDrawer({
  open,
  record,
  onClose,
}: {
  open: boolean;
  record: RecordItem | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && record && (
        <motion.div
          className="fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/55" onMouseDown={onClose} />
          <motion.div
            className="absolute right-0 top-0 h-full w-full max-w-xl"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
          >
            <div className="h-full border-l border-white/10 bg-black/60 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2 text-white/80">
                  <Sparkles className="h-4 w-4 text-white/70" />
                  <span className="text-sm">Record</span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75 hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-white/55">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Day {record.day}
                  </span>
                  <span>·</span>
                  <span>{formatUTC(record.ts)}</span>
                </div>

                <div className="mt-3 text-2xl font-semibold leading-tight text-white/92">
                  {record.title}
                </div>

                <div className="mt-3 text-sm leading-relaxed text-white/68">
                  {record.body}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Pill icon={<User className="h-3.5 w-3.5" />}>{record.author}</Pill>
                  <Pill icon={<Flame className="h-3.5 w-3.5" />}>Heat {record.heat}</Pill>
                  {record.tags.map((t) => (
                    <Pill key={t} icon={<Hash className="h-3.5 w-3.5" />}>
                      {t}
                    </Pill>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10">
                    <Wand2 className="h-4 w-4" />
                    Remix
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs font-medium text-white/70">System Note</div>
                  <div className="mt-1 text-xs text-white/50">
                    This trace is irreversible. It becomes part of the world state once sealed.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConstellationView({
  records,
  onOpen,
}: {
  records: RecordItem[];
  onOpen: (r: RecordItem) => void;
}) {
  // place points deterministically-ish
  const points = useMemo(() => {
    return records.map((r, idx) => {
      const seed = (idx + 1) * 99991;
      const x = (Math.sin(seed) * 0.5 + 0.5) * 92 + 4;
      const y = (Math.cos(seed * 1.3) * 0.5 + 0.5) * 86 + 6;
      const size = 4 + (r.heat / 100) * 10;
      return { r, x, y, size };
    });
  }, [records]);

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="absolute inset-0 bg-[radial-gradient(600px_380px_at_40%_25%,rgba(120,102,255,0.18),transparent_60%),radial-gradient(520px_320px_at_70%_55%,rgba(0,210,255,0.12),transparent_60%)]" />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* faint grid */}
      <div className="absolute inset-0 opacity-[0.18]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>

      {/* connections */}
      <svg className="absolute inset-0 h-full w-full">
        {points.slice(0, 10).map((p, i) => {
          const q = points[(i + 3) % points.length];
          return (
            <line
              key={p.r.id}
              x1={`${p.x}%`}
              y1={`${p.y}%`}
              x2={`${q.x}%`}
              y2={`${q.y}%`}
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {/* points */}
      {points.map((p) => (
        <motion.button
          key={p.r.id}
          className="absolute rounded-full border border-white/15 bg-white/20 backdrop-blur"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            transform: "translate(-50%, -50%)",
          }}
          whileHover={{ scale: 1.25 }}
          onClick={() => onOpen(p.r)}
          title={p.r.title}
        >
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{ boxShadow: ["0 0 0 rgba(120,102,255,0.0)", "0 0 18px rgba(120,102,255,0.55)", "0 0 0 rgba(120,102,255,0.0)"] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 1.5 }}
          />
        </motion.button>
      ))}

      <div className="absolute left-4 top-4 flex items-center gap-2">
        <Pill icon={<Stars className="h-3.5 w-3.5" />}>Constellation</Pill>
        <Pill icon={<Sparkles className="h-3.5 w-3.5" />}>Click stars to open</Pill>
      </div>
    </div>
  );
}

export default function Page() {
  const [records, setRecords] = useState<RecordItem[]>(() => genMockRecords());
  const [view, setView] = useState<ViewMode>("chrono");
  const [rangeDays, setRangeDays] = useState(14);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<RecordItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const [writeMode, setWriteMode] = useState<"short" | "manifesto" | "rule" | "event">("manifesto");
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [systemLine, setSystemLine] = useState("World heartbeat stable · signals streaming…");

  useHotkeys(() => setCmdOpen((v) => !v));

  useEffect(() => {
    const lines = [
      "World heartbeat stable · signals streaming…",
      "Chronicle index rebuilt · trace integrity 99.9%",
      "Entropy rising · preserve what matters.",
      "Noisy day detected · seek true signal.",
      "Irreversible mode enabled · write carefully.",
    ];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % lines.length;
      setSystemLine(lines[i]);
    }, 6500);
    return () => clearInterval(t);
  }, []);

  const heat = useMemo(() => pseudoHeatmap(21), []);
  const chartData = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        d: `D${i + 1}`,
        v: Math.floor(20 + Math.random() * 50),
      })),
    []
  );

  const filtered = useMemo(() => {
    const qq = query.trim().toLowerCase();
    const list = records.filter((r) => {
      if (!qq) return true;
      return (
        r.title.toLowerCase().includes(qq) ||
        r.body.toLowerCase().includes(qq) ||
        r.author.toLowerCase().includes(qq) ||
        r.tags.some((t) => t.toLowerCase().includes(qq))
      );
    });
    return list.slice(0, 28);
  }, [records, query]);

  const totals = useMemo(() => {
    const total = records.length;
    const today = records.filter((r) => r.day === 0).length;
    const authors = new Set(records.map((r) => r.author)).size;
    return { total, today, authors };
  }, [records]);

  const openRecord = (r: RecordItem) => {
    setDetail(r);
    setDrawerOpen(true);
  };

  const jumpTo = (id: string) => {
    const r = records.find((x) => x.id === id);
    if (r) openRecord(r);
  };

  const onNew = () => {
    // focus write area by flashing state (simple)
    const el = document.getElementById("write-panel");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const addRecord = () => {
    const a = author.trim() || "Founder";
    const t = text.trim();
    if (t.length < 12) return;

    const title =
      writeMode === "short"
        ? t.slice(0, 44)
        : writeMode === "rule"
        ? `Rule: ${t.slice(0, 40)}`
        : writeMode === "event"
        ? `Event: ${t.slice(0, 40)}`
        : t.slice(0, 60);

    const body =
      writeMode === "short"
        ? t
        : writeMode === "manifesto"
        ? t
        : writeMode === "rule"
        ? `This rule is binding: ${t}`
        : `This event matters: ${t}`;

    const item: RecordItem = {
      id: `r_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      day: 0,
      title,
      body,
      author: a,
      ts: new Date().toISOString().replace(".000", ""),
      heat: clamp(30 + Math.floor(Math.random() * 70), 0, 100),
      tags: ["signal", writeMode],
    };

    setRecords((prev) => [item, ...prev]);
    setText("");
  };

  return (
    <div className="relative min-h-screen bg-[#070A10] text-white">
      <AmbientBackground />

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        records={records}
        onJump={jumpTo}
        onNew={onNew}
      />

      <DetailDrawer
        open={drawerOpen}
        record={detail}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="relative mx-auto max-w-[1400px] px-5 pb-10 pt-8">
        {/* Top Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-[rgba(120,102,255,0.35)] via-[rgba(0,210,255,0.22)] to-[rgba(255,0,160,0.14)]">
                <Globe className="h-5 w-5 text-white/90" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white/90">现实世界</div>
                <div className="text-xs text-white/50">Today: Day 2 · World start: 2025-12-20 00:00:00 UTC</div>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <WorldPulseBar label={systemLine} />
              <button
                onClick={() => setCmdOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
              >
                <Search className="h-4 w-4" />
                Search
                <span className="ml-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-white/60">
                  ⌘/Ctrl K
                </span>
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>

          {/* stats pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Pill icon={<LayoutDashboard className="h-3.5 w-3.5" />}>
              Total <CountUp value={totals.total} />
            </Pill>
            <Pill icon={<Sparkles className="h-3.5 w-3.5" />}>
              Today <CountUp value={totals.today} />
            </Pill>
            <Pill icon={<User className="h-3.5 w-3.5" />}>
              Authors <CountUp value={totals.authors} />
            </Pill>
            <Pill icon={<Command className="h-3.5 w-3.5" />}>Command Palette enabled</Pill>
          </div>
        </div>

        {/* Main Grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left: Timeline */}
          <div className="lg:col-span-7">
            <GlassCard className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs text-white/55">时间线</div>
                  <div className="text-2xl font-semibold tracking-tight text-white/92">
                    Timeline
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
                      <span>Range</span>
                      <span className="text-white/60">{rangeDays}d</span>
                      <ChevronDown className="h-4 w-4 text-white/60" />
                    </button>
                    {/* simple "fake" dropdown via quick buttons */}
                    <div className="mt-2 flex gap-2">
                      {[7, 14, 30].map((d) => (
                        <button
                          key={d}
                          onClick={() => setRangeDays(d)}
                          className={cn(
                            "rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75 hover:bg-white/10",
                            rangeDays === d && "border-white/20 bg-white/10 text-white"
                          )}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setView("chrono")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-xs hover:bg-white/10",
                      view === "chrono" ? "bg-white/10 text-white" : "bg-white/5 text-white/75"
                    )}
                  >
                    <Clock className="h-4 w-4" />
                    Chrono
                  </button>
                  <button
                    onClick={() => setView("constellation")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-xs hover:bg-white/10",
                      view === "constellation" ? "bg-white/10 text-white" : "bg-white/5 text-white/75"
                    )}
                  >
                    <Stars className="h-4 w-4" />
                    Constellation
                  </button>

                  <button
                    onClick={() => setRecords(genMockRecords())}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/35" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search content / author / tags…"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-2 pl-10 pr-3 text-sm text-white/85 placeholder:text-white/35 outline-none focus:border-white/20"
                  />
                </div>
                <Pill>Sort: Latest</Pill>
                <Pill>Filter: Heat ≥ 0</Pill>
              </div>

              <div className="mt-4">
                <AnimatePresence mode="popLayout">
                  {view === "chrono" ? (
                    <motion.div
                      key="chrono"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between px-1">
                        <div className="text-xs text-white/55">
                          Genesis — the first irreversible mark.
                        </div>
                        <Pill icon={<Sparkles className="h-3.5 w-3.5" />}>
                          Hover to feel depth
                        </Pill>
                      </div>

                      <motion.div layout className="space-y-3">
                        {filtered.map((r) => (
                          <RecordCard
                            key={r.id}
                            r={r}
                            onOpen={openRecord}
                            pinned={!!pinned[r.id]}
                            onPin={(id) => setPinned((p) => ({ ...p, [id]: !p[id] }))}
                          />
                        ))}
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="constellation"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                    >
                      <ConstellationView records={filtered} onOpen={openRecord} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </div>

          {/* Middle: Dashboard */}
          <div className="lg:col-span-2">
            <div className="space-y-5">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-white/70">World Dashboard</div>
                  <LayoutDashboard className="h-4 w-4 text-white/60" />
                </div>
                <div className="mt-3 grid gap-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[11px] text-white/55">World Age</div>
                    <div className="mt-1 text-sm font-semibold text-white/90">
                      2 days · 11 hours
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[11px] text-white/55">Top Signal</div>
                    <div className="mt-1 text-sm font-semibold text-white/90">Irreversible</div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-white/70">Heat (21d)</div>
                  <Flame className="h-4 w-4 text-white/60" />
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1">
                  {heat.map((h, i) => {
                    const a = clamp(h.v / 8, 0.08, 1);
                    return (
                      <div
                        key={i}
                        title={`Day ${h.d}: ${h.v}`}
                        className="h-4 w-full rounded-md border border-white/10"
                        style={{
                          background: `rgba(120,102,255,${0.08 + a * 0.25})`,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="mt-2 text-[11px] text-white/45">
                  Click patterns later → wire real analytics.
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-white/70">Signal Trend</div>
                  <Radar className="h-4 w-4 text-white/60" />
                </div>
                <div className="mt-3 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="d" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(0,0,0,0.75)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 12,
                          color: "rgba(255,255,255,0.9)",
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                      />
                      <Line type="monotone" dataKey="v" stroke="rgba(120,102,255,0.9)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Right: Write */}
          <div className="lg:col-span-3">
            <GlassCard className="p-4" id="write-panel">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/55">留下记录</div>
                  <div className="text-2xl font-semibold tracking-tight text-white/92">
                    Write
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill icon={<Sparkles className="h-3.5 w-3.5" />}>Min 12 chars</Pill>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { k: "short", label: "Short" },
                  { k: "manifesto", label: "Manifesto" },
                  { k: "rule", label: "Rule" },
                  { k: "event", label: "Event" },
                ].map((m) => (
                  <button
                    key={m.k}
                    onClick={() => setWriteMode(m.k as any)}
                    className={cn(
                      "rounded-2xl border border-white/10 px-3 py-2 text-xs hover:bg-white/10",
                      writeMode === m.k ? "bg-white/10 text-white" : "bg-white/5 text-white/75"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/35" />
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your name (author)"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-2 pl-10 pr-3 text-sm text-white/85 placeholder:text-white/35 outline-none focus:border-white/20"
                  />
                </div>

                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What should this world remember?"
                    className="h-40 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/85 placeholder:text-white/35 outline-none focus:border-white/20"
                  />
                  <div className="absolute bottom-3 right-3 text-[11px] text-white/45">
                    {text.trim().length}/240
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xs font-medium text-white/70">Preview</div>
                  <div className="mt-2 text-sm text-white/70">
                    {text.trim()
                      ? text.trim()
                      : "Your words will become an irreversible trace once sealed."}
                  </div>
                </div>

                <SliderConfirm
                  disabled={text.trim().length < 12}
                  onConfirm={addRecord}
                  label="Slide to seal (irreversible)"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCmdOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                  <button
                    onClick={onNew}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                    New
                  </button>
                </div>
              </div>

              <div className="mt-5 text-[11px] text-white/45">
                Pro tip: Your first “world-grade” page should feel alive even with mock data.
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
