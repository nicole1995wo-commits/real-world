"use client";
import LanguagePills from "@/app/LanguagePills";
import { inter, arabic } from "@/app/fonts";

import React, { useEffect, useMemo, useRef, useState } from "react";
import AuthGate from "@/app/AuthGate";
import { I18N, LANGS, type Lang } from "@/lib/i18n";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
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

/** 你的原逻辑全部保留（仅替换文本 + 加语言切换） */

type RecordItem = {
  id: string;
  day: number;
  title: string;
  body: string;
  author: string;
  ts: string;
  heat: number;
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
      if (e.key === "Escape") onCommand();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCommand]);
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function formatUTC(ts: string) {
  return ts.replace("T", " ").replace("Z", " UTC");
}

function pseudoHeatmap(days = 21) {
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
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      {...props}
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
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
        }}
      />
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

function SliderConfirm({
  onConfirm,
  disabled,
  label
}: {
  onConfirm: () => void;
  disabled?: boolean;
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);

  const maxX = () => {
    const track = trackRef.current;
    const handle = handleRef.current;
    if (!track || !handle) return 260;
    return Math.max(0, track.clientWidth - handle.clientWidth);
  };

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
          onDragEnd={(_, info) => {
            const right = maxX();
            if (info.offset.x >= right * 0.82) onConfirm();
          }}
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

export default function Page() {
  // ✅ 语言状态（新增：只影响文案/dir，不动其它功能）
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("lang") as Lang) || "en";
  });
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("lang", lang);
  }, [lang]);
  const t = I18N[lang];

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
  const timelineTopRef = useRef<HTMLDivElement | null>(null);

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
    const tt = setInterval(() => {
      i = (i + 1) % lines.length;
      setSystemLine(lines[i]);
    }, 6500);
    return () => clearInterval(tt);
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
        r.tags.some((ttt) => ttt.toLowerCase().includes(qq))
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

  const onNew = () => {
    const el = document.getElementById("write-panel");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const addRecord = () => {
    const a = author.trim() || "Founder";
    const tt = text.trim();
    if (tt.length < 12) return;

    const title =
      writeMode === "short"
        ? tt.slice(0, 44)
        : writeMode === "rule"
        ? `Rule: ${tt.slice(0, 40)}`
        : writeMode === "event"
        ? `Event: ${tt.slice(0, 40)}`
        : tt.slice(0, 60);

    const body =
      writeMode === "short"
        ? tt
        : writeMode === "manifesto"
        ? tt
        : writeMode === "rule"
        ? `This rule is binding: ${tt}`
        : `This event matters: ${tt}`;

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

    setTimeout(() => {
      timelineTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <AuthGate>
      <div dir={lang === "ar" ? "rtl" : "ltr"} className="relative min-h-screen bg-[#070A10] text-white">
        <AmbientBackground />

        <div className="relative mx-auto max-w-[1400px] px-5 pb-10 pt-8">
          {/* Top Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-[rgba(120,102,255,0.35)] via-[rgba(0,210,255,0.22)] to-[rgba(255,0,160,0.14)]">
                  <Globe className="h-5 w-5 text-white/90" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white/90">{t.appName}</div>
                  <div className="text-xs text-white/50">{t.tagline}</div>
                </div>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <WorldPulseBar label={systemLine} />

                {/* 🌐 Language Switcher */}
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
                  <span className="opacity-70">🌐</span>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Lang)}
                    className="bg-transparent outline-none"
                  >
                    {LANGS.map((x) => (
                      <option key={x.key} value={x.key}>
                        {x.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setCmdOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                  <Search className="h-4 w-4" />
                  {t.search}
                  <span className="ml-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-white/60">
                    ⌘/Ctrl K
                  </span>
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
                  <Share2 className="h-4 w-4" />
                  {t.share}
                </button>
                <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
                  <Settings className="h-4 w-4" />
                  {t.settings}
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
                    <div className="text-xs text-white/55">{t.timeline}</div>
                    <div className="text-2xl font-semibold tracking-tight text-white/92">
                      {t.timeline}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
                        <span>{t.range}</span>
                        <span className="text-white/60">{rangeDays}d</span>
                        <ChevronDown className="h-4 w-4 text-white/60" />
                      </button>
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
                      {t.refresh}
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
                  <Pill>{t.sortLatest}</Pill>
                  <Pill>Filter: Heat ≥ 0</Pill>
                </div>

                <div className="mt-4">
                  <motion.div layout className="space-y-3">
                    <div ref={timelineTopRef} />
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
                      <div className="mt-1 text-sm font-semibold text-white/90">2 days · 11 hours</div>
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
                          className="h-4 w-full rounded-md border border-white/10"
                          style={{ background: `rgba(120,102,255,${0.08 + a * 0.25})` }}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-2 text-[11px] text-white/45">Click patterns later → wire real analytics.</div>
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
                          contentStyle={{ background: "rgba(0,0,0,0.75)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "rgba(255,255,255,0.9)" }}
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
                    <div className="text-xs text-white/55">{t.write}</div>
                    <div className="text-2xl font-semibold tracking-tight text-white/92">{t.write}</div>
                  </div>
                  <Pill icon={<Sparkles className="h-3.5 w-3.5" />}>{t.minChars}</Pill>
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
                        writeMode === (m.k as any) ? "bg-white/10 text-white" : "bg-white/5 text-white/75"
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
                      placeholder={t.yourName}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-2 pl-10 pr-3 text-sm text-white/85 placeholder:text-white/35 outline-none focus:border-white/20"
                    />
                  </div>

                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={t.placeholder}
                      className="h-40 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/85 placeholder:text-white/35 outline-none focus:border-white/20"
                    />
                    <div className="absolute bottom-3 right-3 text-[11px] text-white/45">
                      {text.trim().length}/240
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-xs font-medium text-white/70">{t.preview}</div>
                    <div className="mt-2 text-sm text-white/70">
                      {text.trim() ? text.trim() : "Your words will become an irreversible trace once sealed."}
                    </div>
                  </div>

                  <SliderConfirm
                    disabled={text.trim().length < 12}
                    onConfirm={addRecord}
                    label={t.slideToSeal}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCmdOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10"
                    >
                      <Search className="h-4 w-4" />
                      {t.search}
                    </button>
                    <button
                      onClick={onNew}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4" />
                      {t.new}
                    </button>
                  </div>
                </div>

                <div className="mt-5 text-[11px] text-white/45">
                  {t.proTip}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
