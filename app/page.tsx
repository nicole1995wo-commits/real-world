"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import AuthGate from "@/app/AuthGate";
import { supabase } from "@/lib/supabaseClient";
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
  LayoutDashboard,
  Pin,
  Flame,
  Hash,
  User,
  CheckCircle2,
  ChevronDown
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

type RecordRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  author: string;
  day: number;
  heat: number;
  tags: string[];
  created_at: string;
};

type ViewMode = "chrono";

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function formatUTC(ts: string) {
  return ts.replace("T", " ").replace("Z", " UTC");
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
          filter: "blur(70px)"
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")"
        }}
      />
    </div>
  );
}

function Pill({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
      {icon}
      {children}
    </span>
  );
}

function SliderConfirm({
  onConfirm,
  disabled,
  label = "Slide to seal (irreversible)"
}: {
  onConfirm: () => void;
  disabled?: boolean;
  label?: string;
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
        Rule: login required · write is irreversible · DB owns the truth.
      </div>
    </div>
  );
}

function RecordCard({
  r,
  pinned,
  onPin,
  onOpen,
  flash
}: {
  r: RecordRow;
  pinned: boolean;
  onPin: (id: string) => void;
  onOpen: (r: RecordRow) => void;
  flash: boolean;
}) {
  return (
    <motion.div
      layout
      className={cn(
        "group relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.055]",
        flash &&
          "border-white/30 bg-white/[0.07] shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_0_40px_rgba(120,102,255,0.25)]"
      )}
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
            <span>{formatUTC(r.created_at.replace(".000", ""))}</span>
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
        {(r.tags || []).slice(0, 3).map((t) => (
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
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [view] = useState<ViewMode>("chrono");
  const [rangeDays, setRangeDays] = useState(14);
  const [query, setQuery] = useState("");
  const [pinned, setPinned] = useState<Record<string, boolean>>({});
  const [writeMode, setWriteMode] = useState<"short" | "manifesto" | "rule" | "event">(
    "manifesto"
  );
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [systemLine, setSystemLine] = useState("World heartbeat stable · signals streaming…");
  const [detail, setDetail] = useState<RecordRow | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const timelineTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lines = [
      "World heartbeat stable · signals streaming…",
      "Chronicle index rebuilt · trace integrity 99.9%",
      "Entropy rising · preserve what matters.",
      "Noisy day detected · seek true signal.",
      "Irreversible mode enabled · write carefully."
    ];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % lines.length;
      setSystemLine(lines[i]);
    }, 6500);
    return () => clearInterval(t);
  }, []);

  async function loadRecords() {
    const { data: s } = await supabase.auth.getSession();
    const user = s.session?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from("records_v2")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(80);

    if (!error && data) setRecords(data as any);
  }

  useEffect(() => {
    loadRecords();
    const { data: sub } = supabase.auth.onAuthStateChange(() => loadRecords());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const qq = query.trim().toLowerCase();
    const list = records.filter((r) => {
      if (!qq) return true;
      return (
        r.title.toLowerCase().includes(qq) ||
        r.body.toLowerCase().includes(qq) ||
        r.author.toLowerCase().includes(qq) ||
        (r.tags || []).some((t) => t.toLowerCase().includes(qq))
      );
    });
    return list;
  }, [records, query]);

  const totals = useMemo(() => {
    const total = records.length;
    const today = records.filter((r) => r.day === 0).length;
    const authors = new Set(records.map((r) => r.author)).size;
    return { total, today, authors };
  }, [records]);

  const heat = useMemo(
    () =>
      Array.from({ length: 21 }).map((_, i) => ({
        d: i + 1,
        v: Math.floor(Math.pow(Math.random(), 0.7) * 8)
      })),
    []
  );

  const chartData = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        d: `D${i + 1}`,
        v: Math.floor(20 + Math.random() * 50)
      })),
    []
  );

  async function addRecord() {
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

    const { data: s } = await supabase.auth.getSession();
    const user = s.session?.user;
    if (!user) return;

    const payload = {
      user_id: user.id,
      title,
      body,
      author: a,
      heat: clamp(30 + Math.floor(Math.random() * 70), 0, 100),
      tags: ["signal", writeMode]
    };

    const { data, error } = await supabase.from("records_v2").insert(payload).select("*").single();
    if (error) return;

    setRecords((prev) => [data as any, ...prev]);
    setText("");

    setFlashId((data as any).id);
    setTimeout(() => setFlashId(null), 2500);

    setTimeout(() => {
      timelineTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  return (
    <AuthGate>
      <div className="relative min-h-screen bg-[#070A10] text-white">
        <AmbientBackground />

        <AnimatePresence>
          {detail && (
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={() => setDetail(null)}
            >
              <div className="absolute inset-0 bg-black/55" />
              <motion.div
                className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-white/10 bg-black/60 backdrop-blur-xl"
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="p-5">
                  <div className="text-xs text-white/55">
                    Day {detail.day} · {formatUTC(detail.created_at.replace(".000", ""))}
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-white/92">{detail.title}</div>
                  <div className="mt-3 text-sm text-white/70 leading-relaxed">{detail.body}</div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Pill icon={<User className="h-3.5 w-3.5" />}>{detail.author}</Pill>
                    <Pill icon={<Flame className="h-3.5 w-3.5" />}>Heat {detail.heat}</Pill>
                    {(detail.tags || []).map((t) => (
                      <Pill key={t} icon={<Hash className="h-3.5 w-3.5" />}>
                        {t}
                      </Pill>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mx-auto max-w-[1400px] px-5 pb-10 pt-8">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-[rgba(120,102,255,0.35)] via-[rgba(0,210,255,0.22)] to-[rgba(255,0,160,0.14)]">
                  <Globe className="h-5 w-5 text-white/90" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white/90">现实世界</div>
                  <div className="text-xs text-white/50">World start: 2025-12-20 00:00:00 UTC</div>
                </div>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <div className="relative w-[320px] overflow-hidden rounded-full border border-white/10 bg-white/5 px-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <Radar className="h-3.5 w-3.5 text-white/70" />
                    <span className="truncate">{systemLine}</span>
                  </div>
                  <motion.div
                    className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-30%", "140%"] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>

                <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
                  <Share2 className="h-4 w-4" /> Share
                </button>
                <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
                  <Settings className="h-4 w-4" /> Settings
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Pill icon={<LayoutDashboard className="h-3.5 w-3.5" />}>Total {totals.total}</Pill>
              <Pill icon={<Sparkles className="h-3.5 w-3.5" />}>Today {totals.today}</Pill>
              <Pill icon={<User className="h-3.5 w-3.5" />}>Authors {totals.authors}</Pill>
            </div>
          </div>

          {/* Grid */}
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Timeline */}
            <div className="lg:col-span-7">
              <GlassCard className="p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xs text-white/55">时间线</div>
                    <div className="text-2xl font-semibold tracking-tight text-white/92">Timeline</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
                        <span>Range</span>
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
                      onClick={loadRecords}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                    >
                      <RefreshCcw className="h-4 w-4" /> Refresh
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/35" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search title / body / author / tags…"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-2 pl-10 pr-3 text-sm text-white/85 placeholder:text-white/35 outline-none focus:border-white/20"
                    />
                  </div>
                  <Pill icon={<Sparkles className="h-3.5 w-3.5" />}>Irreversible</Pill>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-white/55 px-1">Genesis — the first irreversible mark.</div>

                  <motion.div layout className="mt-3 space-y-3">
                    <div ref={timelineTopRef} />
                    {filtered.map((r) => (
                      <RecordCard
                        key={r.id}
                        r={r}
                        pinned={!!pinned[r.id]}
                        onPin={(id) => setPinned((p) => ({ ...p, [id]: !p[id] }))}
                        onOpen={setDetail}
                        flash={flashId === r.id}
                      />
                    ))}
                    {filtered.length === 0 && (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
                        你还没有记录。写下第一条“不可撤回”的痕迹。
                      </div>
                    )}
                  </motion.div>
                </div>
              </GlassCard>
            </div>

            {/* Dashboard */}
            <div className="lg:col-span-2">
              <div className="space-y-5">
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-white/70">World Dashboard</div>
                    <LayoutDashboard className="h-4 w-4 text-white/60" />
                  </div>
                  <div className="mt-3 grid gap-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-[11px] text-white/55">Top Signal</div>
                      <div className="mt-1 text-sm font-semibold text-white/90">Irreversible</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-[11px] text-white/55">Identity</div>
                      <div className="mt-1 text-sm font-semibold text-white/90">Verified Email</div>
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
                  <div className="mt-2 text-[11px] text-white/45">Later → real analytics.</div>
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
                        <XAxis
                          dataKey="d"
                          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={24}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(0,0,0,0.75)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 12,
                            color: "rgba(255,255,255,0.9)"
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

            {/* Write */}
            <div className="lg:col-span-3">
              <GlassCard className="p-4" id="write-panel">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-white/55">留下记录</div>
                    <div className="text-2xl font-semibold tracking-tight text-white/92">Write</div>
                  </div>
                  <Pill icon={<Sparkles className="h-3.5 w-3.5" />}>Min 12 chars</Pill>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { k: "short", label: "Short" },
                    { k: "manifesto", label: "Manifesto" },
                    { k: "rule", label: "Rule" },
                    { k: "event", label: "Event" }
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
                      placeholder="Your display name"
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

                  <SliderConfirm disabled={text.trim().length < 12} onConfirm={addRecord} />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={loadRecords}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10"
                    >
                      <RefreshCcw className="h-4 w-4" /> Refresh
                    </button>
                    <button
                      onClick={() => setText("")}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10"
                    >
                      <Plus className="h-4 w-4" /> New
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
