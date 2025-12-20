"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * =========================
 *  Real World — Perfect Build
 *  - Day system (A1)
 *  - Timeline grouping + Day 0 pinned (A1.1 + A1.2)
 *  - World rules + world mood (A)
 *  - Dark mode (system + manual)
 *  - Search + highlight
 *  - Author filter (click to filter)
 *  - Shareable links (query params)
 *  - Product-level stats
 *  - Strong client-side anti-spam
 * =========================
 */

// --------------------
// World time settings
// --------------------
const WORLD_START = new Date("2025-12-20T00:00:00Z");

function getWorldDay(now = new Date()) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = now.getTime() - WORLD_START.getTime();
  return Math.max(0, Math.floor(diff / msPerDay));
}

function formatDateUTC(d: Date) {
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

function getWorldMood(day: number) {
  if (day === 0) return "Genesis — the first irreversible mark.";
  if (day === 1) return "Echo — the world begins to respond.";
  if (day <= 3) return "Formation — patterns start to appear.";
  if (day <= 7) return "Habit — people return, not for rewards, but for meaning.";
  if (day <= 14) return "Memory — history starts to feel heavy.";
  return "Continuity — the world keeps moving, with or without you.";
}

// --------------------
// Types
// --------------------
type RecordItem = {
  id: string;
  content: string;
  author: string;
  day: number;
  created_at: string;
};

// --------------------
// Anti-spam (client-side)
// --------------------
const MIN_CHARS = 12;
const MIN_INTERVAL_SECONDS = 60;
const COOLDOWN_SECONDS = 5;

function normalizeText(s: string) {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

// daily once per browser
function canSubmitToday(day: number) {
  try {
    const v = localStorage.getItem("realworld:last_submit_day");
    if (!v) return true;
    return Number(v) !== day;
  } catch {
    return true;
  }
}
function markSubmittedToday(day: number) {
  try {
    localStorage.setItem("realworld:last_submit_day", String(day));
  } catch {}
}

// minimum interval per browser
function canSubmitByInterval() {
  try {
    const v = localStorage.getItem("realworld:last_submit_ts");
    if (!v) return true;
    const last = Number(v);
    return Date.now() - last >= MIN_INTERVAL_SECONDS * 1000;
  } catch {
    return true;
  }
}
function markSubmitTimestamp() {
  try {
    localStorage.setItem("realworld:last_submit_ts", String(Date.now()));
  } catch {}
}

// duplicate guard per day
function isDuplicateToday(day: number, content: string) {
  try {
    const key = `realworld:dup:${day}`;
    const v = localStorage.getItem(key);
    if (!v) return false;
    return v === normalizeText(content);
  } catch {
    return false;
  }
}
function markDuplicateToday(day: number, content: string) {
  try {
    const key = `realworld:dup:${day}`;
    localStorage.setItem(key, normalizeText(content));
  } catch {}
}

// --------------------
// Query helpers (share links)
// --------------------
function getQueryParam(name: string) {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}
function setQueryParams(params: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === "") url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  window.history.replaceState({}, "", url.toString());
}
async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

// --------------------
// Theme
// --------------------
type Theme = "system" | "light" | "dark";

function getSystemDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function loadTheme(): Theme {
  try {
    return (localStorage.getItem("realworld:theme") as Theme) || "system";
  } catch {
    return "system";
  }
}
function saveTheme(t: Theme) {
  try {
    localStorage.setItem("realworld:theme", t);
  } catch {}
}

// --------------------
// Highlight
// --------------------
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function highlight(text: string, query: string) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        re.test(p) ? (
          <mark key={i} style={{ padding: "0 2px", borderRadius: 4 }}>
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// --------------------
// Styles
// --------------------
function styles(dark: boolean) {
  const bg = dark ? "#0b0d10" : "#ffffff";
  const fg = dark ? "#e9eef5" : "#111418";
  const muted = dark ? "rgba(233,238,245,0.72)" : "rgba(17,20,24,0.65)";
  const border = dark ? "rgba(233,238,245,0.16)" : "rgba(17,20,24,0.12)";
  const cardBg = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";
  const inputBg = dark ? "rgba(255,255,255,0.06)" : "white";
  const btnBg = dark ? "rgba(255,255,255,0.08)" : "white";
  const btnPrimaryBg = dark ? "#e9eef5" : "#111418";
  const btnPrimaryFg = dark ? "#0b0d10" : "white";

  return {
    page: {
      maxWidth: 980,
      margin: "40px auto",
      padding: "0 16px 60px",
      fontFamily: "system-ui",
      background: bg,
      color: fg,
      minHeight: "100vh",
      transition: "background 150ms ease, color 150ms ease",
    } as React.CSSProperties,
    card: {
      border: `1px solid ${border}`,
      borderRadius: 14,
      padding: 16,
      background: cardBg,
    } as React.CSSProperties,
    row: { display: "flex", gap: 12, flexWrap: "wrap" as const } as React.CSSProperties,
    label: { fontSize: 12, opacity: 0.75 } as React.CSSProperties,
    small: { fontSize: 12, opacity: 0.82 } as React.CSSProperties,
    input: {
      padding: 10,
      borderRadius: 12,
      border: `1px solid ${border}`,
      background: inputBg,
      color: fg,
      outline: "none",
      width: "100%",
    } as React.CSSProperties,
    button: {
      padding: "9px 12px",
      borderRadius: 12,
      border: `1px solid ${border}`,
      background: btnBg,
      color: fg,
      cursor: "pointer",
    } as React.CSSProperties,
    buttonPrimary: {
      padding: "9px 12px",
      borderRadius: 12,
      border: `1px solid ${border}`,
      background: btnPrimaryBg,
      color: btnPrimaryFg,
      cursor: "pointer",
    } as React.CSSProperties,
    divider: {
      margin: "24px 0",
      border: "none",
      borderTop: `1px solid ${border}`,
    } as React.CSSProperties,
    pill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 999,
      border: `1px solid ${border}`,
      background: cardBg,
      fontSize: 12,
      opacity: 0.95,
    } as React.CSSProperties,
    linkBtn: {
      padding: 0,
      border: "none",
      background: "transparent",
      color: fg,
      cursor: "pointer",
      textDecoration: "underline",
      opacity: 0.92,
    } as React.CSSProperties,
    muted,
  };
}

export default function Home() {
  const todayDay = getWorldDay();

  // theme
  const [theme, setTheme] = useState<Theme>("system");
  const [systemDark, setSystemDark] = useState(false);

  // data
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // submit
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [honeypot, setHoneypot] = useState(""); // hidden trap
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [allowedToday, setAllowedToday] = useState(true);

  // cooldown
  const [cooldownEnabled, setCooldownEnabled] = useState(true);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownTimer = useRef<number | null>(null);

  // controls
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState<string>("");
  const [onlyToday, setOnlyToday] = useState(false);
  const [onlyGenesis, setOnlyGenesis] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);
  const [authorFilter, setAuthorFilter] = useState("");
  const [daysToRender, setDaysToRender] = useState(14);

  // share
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  // theme init
  useEffect(() => {
    const t = loadTheme();
    setTheme(t);
    setSystemDark(getSystemDark());

    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => setSystemDark(mq.matches);
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    }
  }, []);

  // init query + data
  useEffect(() => {
    const q = getQueryParam("q") || "";
    const d = getQueryParam("day") || "";
    const t = getQueryParam("today") === "1";
    const g = getQueryParam("genesis") === "1";
    const s = getQueryParam("sort") || "new";
    const a = getQueryParam("author") || "";
    const th = (getQueryParam("theme") as Theme) || "";

    setSearch(q);
    setDayFilter(d);
    setOnlyToday(t);
    setOnlyGenesis(g);
    setSortNewest(s !== "old");
    setAuthorFilter(a);

    if (th === "system" || th === "light" || th === "dark") {
      setTheme(th);
      saveTheme(th);
    }

    fetchRecords();
    setAllowedToday(canSubmitToday(todayDay));

    return () => {
      if (cooldownTimer.current) window.clearInterval(cooldownTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync query
  useEffect(() => {
    setQueryParams({
      q: search || null,
      day: dayFilter || null,
      today: onlyToday ? "1" : null,
      genesis: onlyGenesis ? "1" : null,
      sort: sortNewest ? "new" : "old",
      author: authorFilter || null,
      theme: theme !== "system" ? theme : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, dayFilter, onlyToday, onlyGenesis, sortNewest, authorFilter, theme]);

  // daily allowance
  useEffect(() => {
    setAllowedToday(canSubmitToday(todayDay));
  }, [todayDay]);

  const dark = theme === "dark" || (theme === "system" && systemDark);
  const S = styles(dark);

  async function fetchRecords() {
    setLoadingRecords(true);
    const { data, error } = await supabase.from("records").select("*").order("created_at", { ascending: true });
    setLoadingRecords(false);
    if (error) {
      console.error(error);
      return;
    }
    if (data) setRecords(data as RecordItem[]);
  }

  function startCooldown(seconds: number) {
    setCooldownLeft(seconds);
    if (cooldownTimer.current) window.clearInterval(cooldownTimer.current);
    cooldownTimer.current = window.setInterval(() => {
      setCooldownLeft((v) => {
        if (v <= 1) {
          if (cooldownTimer.current) window.clearInterval(cooldownTimer.current);
          cooldownTimer.current = null;
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  async function submitRecord() {
    setSubmitError(null);
    setShareMsg(null);

    if (honeypot.trim()) {
      setSubmitError("Submission blocked.");
      return;
    }

    if (!author.trim() || !content.trim()) {
      setSubmitError("Please fill in your name and a record.");
      return;
    }

    if (content.trim().length < MIN_CHARS) {
      setSubmitError(`Record is too short. Minimum ${MIN_CHARS} characters.`);
      return;
    }

    if (!allowedToday) {
      setSubmitError("You have already submitted a record today (in this browser). Come back tomorrow.");
      return;
    }

    if (!canSubmitByInterval()) {
      setSubmitError(`Please wait at least ${MIN_INTERVAL_SECONDS}s between submissions (this browser).`);
      return;
    }

    if (isDuplicateToday(todayDay, content)) {
      setSubmitError("Duplicate detected (same day, same content). Please write something new.");
      return;
    }

    if (cooldownEnabled && cooldownLeft > 0) {
      setSubmitError(`Please wait ${cooldownLeft}s before submitting (cooldown).`);
      return;
    }

    if (cooldownEnabled) startCooldown(COOLDOWN_SECONDS);

    setSubmitting(true);

    const { error } = await supabase.from("records").insert({
      content: content.trim(),
      author: author.trim(),
      day: todayDay,
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      setSubmitError("Submit failed. Please try again.");
      return;
    }

    markSubmittedToday(todayDay);
    markSubmitTimestamp();
    markDuplicateToday(todayDay, content);
    setAllowedToday(false);

    setContent("");
    await fetchRecords();
  }

  function resetFilters() {
    setSearch("");
    setDayFilter("");
    setOnlyToday(false);
    setOnlyGenesis(false);
    setSortNewest(true);
    setAuthorFilter("");
    setDaysToRender(14);
  }

  async function copyShareLink() {
    await copyToClipboard(window.location.href);
    setShareMsg("Link copied. Anyone opening it will see the same view.");
    window.setTimeout(() => setShareMsg(null), 2400);
  }

  function setThemeAndPersist(t: Theme) {
    setTheme(t);
    saveTheme(t);
  }

  // Derived data
  const filteredRecords = useMemo(() => {
    let list = [...records];
    list.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortNewest ? tb - ta : ta - tb;
    });

    const s = search.trim().toLowerCase();
    if (s) {
      list = list.filter((r) => r.content.toLowerCase().includes(s) || r.author.toLowerCase().includes(s) || String(r.day).includes(s));
    }

    if (authorFilter.trim()) {
      const af = authorFilter.trim().toLowerCase();
      list = list.filter((r) => r.author.toLowerCase() === af);
    }

    if (onlyGenesis) list = list.filter((r) => r.day === 0);
    if (onlyToday) list = list.filter((r) => r.day === todayDay);

    if (dayFilter.trim() !== "") {
      const d = Number(dayFilter);
      if (!Number.isNaN(d)) list = list.filter((r) => r.day === d);
    }

    return list;
  }, [records, sortNewest, search, authorFilter, onlyGenesis, onlyToday, dayFilter, todayDay]);

  const stats = useMemo(() => {
    const total = records.length;
    const todayCount = records.filter((r) => r.day === todayDay).length;
    const authors = new Set(records.map((r) => r.author.trim()).filter(Boolean)).size;
    const worldAge = todayDay;

    return { total, todayCount, authors, worldAge };
  }, [records, todayDay]);

  const { recordsByDay, sortedDaysAll, sortedDaysRendered } = useMemo(() => {
    const map: Record<number, RecordItem[]> = {};
    for (const r of filteredRecords) {
      map[r.day] = map[r.day] || [];
      map[r.day].push(r);
    }

    const allDays = Object.keys(map).map(Number);
    const nonZero = allDays.filter((d) => d !== 0).sort((a, b) => b - a);
    const allSorted = (map[0] ? [0] : []).concat(nonZero);

    const renderedNonZero = nonZero.slice(0, Math.max(0, daysToRender));
    const rendered = (map[0] ? [0] : []).concat(renderedNonZero);

    return { recordsByDay: map, sortedDaysAll: allSorted, sortedDaysRendered: rendered };
  }, [filteredRecords, daysToRender]);

  const hasMoreDays = sortedDaysRendered.length < sortedDaysAll.length;

  return (
    <main style={S.page}>
      <header style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <h1 style={{ margin: "0 0 6px" }}>Real World</h1>
            <div style={S.small}>
              <strong>Today:</strong> Day {todayDay} · <span style={{ color: S.muted }}>World age:</span> {stats.worldAge} days ·{" "}
              <span style={{ color: S.muted }}>World start:</span> {formatDateUTC(WORLD_START)}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={S.small}>Theme</span>
            <select value={theme} onChange={(e) => setThemeAndPersist(e.target.value as Theme)} style={{ ...S.input, width: 140 }}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 10, fontStyle: "italic", opacity: 0.88 }}>
          All actions here are irreversible.
        </div>
      </header>

      <section style={{ ...S.card, marginBottom: 12 }}>
        <div style={S.row}>
          <div>
            <div style={S.label}>Total records</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{stats.total}</div>
          </div>
          <div>
            <div style={S.label}>Today</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{stats.todayCount}</div>
          </div>
          <div>
            <div style={S.label}>Authors</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{stats.authors}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={copyShareLink} style={S.button}>Copy share link</button>
            {shareMsg && <div style={{ marginTop: 6, ...S.small }}>{shareMsg}</div>}
          </div>
        </div>
      </section>

      <section style={{ ...S.card, marginBottom: 12 }}>
        <div style={S.row}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={S.label}>Search</div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="content / author" style={S.input} />
          </div>
          <div style={{ width: 140 }}>
            <div style={S.label}>Filter Day</div>
            <input value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} placeholder="e.g. 0, 1, 12" style={S.input} />
          </div>
          <div style={{ width: 180 }}>
            <div style={S.label}>Filter Author</div>
            <input value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)} placeholder="exact author name" style={S.input} />
          </div>
          <div style={{ minWidth: 220 }}>
            <div style={S.label}>Quick</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
              <button onClick={() => setOnlyToday((v) => !v)} style={S.button}>Today</button>
              <button onClick={() => setOnlyGenesis((v) => !v)} style={S.button}>Genesis</button>
              <button onClick={resetFilters} style={S.button}>Reset</button>
            </div>
          </div>
          <div style={{ minWidth: 180 }}>
            <div style={S.label}>Sort</div>
            <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
              <button onClick={() => setSortNewest(true)} style={S.button}>Newest</button>
              <button onClick={() => setSortNewest(false)} style={S.button}>Oldest</button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <details>
            <summary style={{ cursor: "pointer" }}>World Rules</summary>
            <div style={{ marginTop: 10, lineHeight: 1.6 }}>
              <p><strong>What is this?</strong><br />This is a real world. Everything you leave here is recorded — and irreversible.</p>
              <p><strong>Three Laws</strong></p>
              <ol>
                <li><strong>No take-backs:</strong> Once submitted, it cannot be edited or deleted.</li>
                <li><strong>Only actions matter:</strong> Not who you are — what you do.</li>
                <li><strong>Impact is existence:</strong> The only thing that matters is whether you truly changed this world.</li>
              </ol>
              <p><strong>If you hesitate — don’t write yet.</strong></p>
            </div>
          </details>
        </div>
      </section>

      <section style={{ ...S.card, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ margin: 0 }}>Timeline</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={S.small}>Render days</span>
            <select value={String(daysToRender)} onChange={(e) => setDaysToRender(Number(e.target.value))} style={{ ...S.input, width: 120 }}>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="9999">All</option>
            </select>
            <button onClick={fetchRecords} style={S.button} disabled={loadingRecords}>
              {loadingRecords ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 8, ...S.small }}>
          Day 0 stays on top. Other days are newest-first.
          {hasMoreDays && " More days exist but are not rendered."}
        </div>

        <div style={{ marginTop: 14 }}>
          {sortedDaysRendered.map((day) => (
            <div key={day} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0 }}>{day === 0 ? "Day 0 (Genesis)" : `Day ${day}`}</h3>
                <span style={S.small}>{getWorldMood(day)}</span>
                {day === todayDay && <span style={S.pill}>Today</span>}
              </div>

              <div style={{ marginTop: 10 }}>
                {recordsByDay[day].map((r) => (
                  <div key={r.id} style={{ marginBottom: 12 }}>
                    <div style={{ whiteSpace: "pre-wrap" }}>{highlight(r.content, search)}</div>
                    <small style={{ opacity: 0.85 }}>
                      —{" "}
                      <button style={S.linkBtn} onClick={() => setAuthorFilter(r.author)} title="Filter by this author">
                        {highlight(r.author, search)}
                      </button>
                      {" · "}
                      <span style={{ opacity: 0.7 }}>{new Date(r.created_at).toLocaleString()}</span>
                    </small>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr style={S.divider} />

      <section style={S.card}>
        <h2 style={{ marginTop: 0 }}>Leave a record</h2>

        <div style={{ marginBottom: 8, opacity: 0.88 }}>
          {allowedToday
            ? `Write something you would accept being seen years from now. (min ${MIN_CHARS} chars)`
            : "You have already submitted a record today (in this browser). Come back tomorrow."}
        </div>

        <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

        <div style={S.row}>
          <div style={{ minWidth: 240, flex: 1 }}>
            <div style={S.label}>Your name</div>
            <input placeholder="Your name" value={author} onChange={(e) => setAuthor(e.target.value)} style={S.input} />
          </div>

          <div style={{ minWidth: 320 }}>
            <div style={S.label}>Safety</div>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={cooldownEnabled} onChange={(e) => setCooldownEnabled(e.target.checked)} />
              Enable {COOLDOWN_SECONDS}s cooldown
            </label>
            {cooldownEnabled && cooldownLeft > 0 && <div style={{ marginTop: 6, ...S.small }}>Cooldown: {cooldownLeft}s</div>}
            <div style={{ marginTop: 6, ...S.small }}>Min interval: {MIN_INTERVAL_SECONDS}s (this browser)</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={S.label}>Record</div>
          <textarea
            placeholder="What should this world remember?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ ...S.input, height: 150, resize: "vertical" as const }}
          />
        </div>

        {submitError && <div style={{ marginTop: 10, color: "crimson" }}>{submitError}</div>}

        <div style={{ marginTop: 12 }}>
          <button onClick={submitRecord} disabled={submitting || !allowedToday} style={submitting || !allowedToday ? S.button : S.buttonPrimary}>
            {submitting ? "Submitting..." : "Submit (irreversible)"}
          </button>
        </div>

        <div style={{ marginTop: 10, ...S.small }}>
          Tip: click an author name to filter · share the exact view via “Copy share link”.
        </div>
      </section>

      <footer style={{ marginTop: 18, ...S.small, opacity: 0.75 }}>
        Built for a world where history cannot be rewritten.
      </footer>
    </main>
  );
}
