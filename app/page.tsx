"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

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

// A1.4: World "mood" per day (simple rule-based)
function getWorldMood(day: number) {
  if (day === 0) return "Genesis — the first irreversible mark.";
  if (day === 1) return "Echo — the world begins to respond.";
  if (day <= 3) return "Formation — patterns start to appear.";
  if (day <= 7) return "Habit — people return, not for rewards, but for meaning.";
  if (day <= 14) return "Memory — history starts to feel heavy.";
  return "Continuity — the world keeps moving, with or without you.";
}

type RecordItem = {
  id: string;
  content: string;
  author: string;
  day: number;
  created_at: string;
};

// --------------------
// One record per day (per browser)
// --------------------
function canSubmitToday(day: number) {
  try {
    const key = `realworld:last_submit_day`;
    const v = localStorage.getItem(key);
    if (!v) return true;
    return Number(v) !== day;
  } catch {
    return true;
  }
}

function markSubmittedToday(day: number) {
  try {
    localStorage.setItem(`realworld:last_submit_day`, String(day));
  } catch {}
}

// --------------------
// Query helpers (shareable links)
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

function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text);
}

// --------------------
// UI helpers
// --------------------
const ui = {
  card: {
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 12,
    padding: 16,
    background: "white",
  } as React.CSSProperties,
  row: { display: "flex", gap: 12, flexWrap: "wrap" as const } as React.CSSProperties,
  label: { fontSize: 12, opacity: 0.75 } as React.CSSProperties,
  input: { padding: 8, borderRadius: 8, border: "1px solid rgba(0,0,0,0.2)" } as React.CSSProperties,
  button: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.2)",
    background: "white",
    cursor: "pointer",
  } as React.CSSProperties,
  buttonPrimary: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.2)",
    background: "black",
    color: "white",
    cursor: "pointer",
  } as React.CSSProperties,
  small: { fontSize: 12, opacity: 0.8 } as React.CSSProperties,
};

export default function Home() {
  const todayDay = getWorldDay();

  // Data
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Submit
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [allowedToday, setAllowedToday] = useState(true);

  // Luxury: “cooldown” to reduce impulse
  const [cooldownEnabled, setCooldownEnabled] = useState(true);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownTimer = useRef<number | null>(null);

  // Controls
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState<string>(""); // "" means all
  const [onlyToday, setOnlyToday] = useState(false);
  const [onlyGenesis, setOnlyGenesis] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);

  // Share hint
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  useEffect(() => {
    // initialize from URL query
    const q = getQueryParam("q") || "";
    const d = getQueryParam("day") || "";
    const t = getQueryParam("today") === "1";
    const g = getQueryParam("genesis") === "1";
    const s = getQueryParam("sort") || "new";

    setSearch(q);
    setDayFilter(d);
    setOnlyToday(t);
    setOnlyGenesis(g);
    setSortNewest(s !== "old");

    fetchRecords();
    setAllowedToday(canSubmitToday(todayDay));

    // cleanup cooldown
    return () => {
      if (cooldownTimer.current) window.clearInterval(cooldownTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // keep query in sync (shareable links)
    setQueryParams({
      q: search || null,
      day: dayFilter || null,
      today: onlyToday ? "1" : null,
      genesis: onlyGenesis ? "1" : null,
      sort: sortNewest ? "new" : "old",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, dayFilter, onlyToday, onlyGenesis, sortNewest]);

  useEffect(() => {
    setAllowedToday(canSubmitToday(todayDay));
  }, [todayDay]);

  async function fetchRecords() {
    setLoadingRecords(true);

    const { data, error } = await supabase
      .from("records")
      .select("*")
      .order("created_at", { ascending: true }); // base order (we re-sort in UI)

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

    if (!author.trim() || !content.trim()) {
      setSubmitError("Please fill in your name and a record.");
      return;
    }

    if (!allowedToday) {
      setSubmitError("You have already submitted a record today (in this browser). Come back tomorrow.");
      return;
    }

    if (cooldownEnabled && cooldownLeft > 0) {
      setSubmitError(`Please wait ${cooldownLeft}s before submitting (cooldown).`);
      return;
    }

    // Start a short cooldown after pressing submit (reduces spam)
    if (cooldownEnabled) startCooldown(5);

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
    setAllowedToday(false);

    setContent("");
    await fetchRecords();
  }

  // --------------------
  // Derived data (filters + grouping)
  // --------------------
  const filteredRecords = useMemo(() => {
    let list = [...records];

    // sort
    list.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortNewest ? tb - ta : ta - tb;
    });

    // filters
    const s = search.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (r) =>
          r.content.toLowerCase().includes(s) ||
          r.author.toLowerCase().includes(s) ||
          String(r.day).includes(s)
      );
    }

    if (onlyGenesis) {
      list = list.filter((r) => r.day === 0);
    }

    if (onlyToday) {
      list = list.filter((r) => r.day === todayDay);
    }

    if (dayFilter.trim() !== "") {
      const d = Number(dayFilter);
      if (!Number.isNaN(d)) list = list.filter((r) => r.day === d);
    }

    return list;
  }, [records, search, dayFilter, onlyToday, onlyGenesis, sortNewest, todayDay]);

  const { recordsByDay, sortedDays, totalCount, todayCount } = useMemo(() => {
    const map: Record<number, RecordItem[]> = {};
    for (const r of filteredRecords) {
      map[r.day] = map[r.day] || [];
      map[r.day].push(r);
    }

    const allDays = Object.keys(map).map(Number);

    // Day 0 always first, other days newest first
    const nonZero = allDays.filter((d) => d !== 0).sort((a, b) => b - a);
    const days = (map[0] ? [0] : []).concat(nonZero);

    const total = filteredRecords.length;
    const todayC = filteredRecords.filter((r) => r.day === todayDay).length;

    return { recordsByDay: map, sortedDays: days, totalCount: total, todayCount: todayC };
  }, [filteredRecords, todayDay]);

  async function copyShareLink() {
    const url = window.location.href;
    await copyToClipboard(url);
    setShareMsg("Link copied. Anyone opening it will see the same filters.");
    window.setTimeout(() => setShareMsg(null), 3000);
  }

  function resetFilters() {
    setSearch("");
    setDayFilter("");
    setOnlyToday(false);
    setOnlyGenesis(false);
    setSortNewest(true);
  }

  // --------------------
  // UI
  // --------------------
  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ marginBottom: 6 }}>Real World</h1>
        <div style={{ ...ui.small, marginBottom: 6 }}>
          <strong>Today:</strong> Day {todayDay} · <span style={{ opacity: 0.7 }}>World start:</span>{" "}
          {formatDateUTC(WORLD_START)}
        </div>
        <div style={{ fontStyle: "italic", opacity: 0.85 }}>All actions here are irreversible.</div>
      </header>

      {/* Dashboard */}
      <section style={{ ...ui.card, marginBottom: 14 }}>
        <div style={ui.row}>
          <div>
            <div style={ui.label}>Records (current view)</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{totalCount}</div>
          </div>

          <div>
            <div style={ui.label}>Today in view</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{todayCount}</div>
          </div>

          <div>
            <div style={ui.label}>Write permission</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {allowedToday ? "Available" : "Used today"}
            </div>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <button onClick={copyShareLink} style={ui.button}>
              Copy share link
            </button>
            {shareMsg && <div style={{ marginTop: 6, ...ui.small }}>{shareMsg}</div>}
          </div>
        </div>
      </section>

      {/* Controls */}
      <section style={{ ...ui.card, marginBottom: 14 }}>
        <div style={ui.row}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={ui.label}>Search (content / author)</div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={{ ...ui.input, width: "100%" }}
            />
          </div>

          <div style={{ width: 160 }}>
            <div style={ui.label}>Filter Day</div>
            <input
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              placeholder="e.g. 0, 1, 12"
              style={{ ...ui.input, width: "100%" }}
            />
          </div>

          <div style={{ minWidth: 170 }}>
            <div style={ui.label}>Quick filters</div>
            <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
              <button
                onClick={() => setOnlyToday((v) => !v)}
                style={{ ...ui.button, background: onlyToday ? "black" : "white", color: onlyToday ? "white" : "black" }}
              >
                Today
              </button>
              <button
                onClick={() => setOnlyGenesis((v) => !v)}
                style={{
                  ...ui.button,
                  background: onlyGenesis ? "black" : "white",
                  color: onlyGenesis ? "white" : "black",
                }}
              >
                Genesis
              </button>
              <button onClick={resetFilters} style={ui.button}>
                Reset
              </button>
            </div>
          </div>

          <div style={{ minWidth: 160 }}>
            <div style={ui.label}>Sort</div>
            <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
              <button
                onClick={() => setSortNewest(true)}
                style={{ ...ui.button, background: sortNewest ? "black" : "white", color: sortNewest ? "white" : "black" }}
              >
                Newest
              </button>
              <button
                onClick={() => setSortNewest(false)}
                style={{ ...ui.button, background: !sortNewest ? "black" : "white", color: !sortNewest ? "white" : "black" }}
              >
                Oldest
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <details>
            <summary style={{ cursor: "pointer" }}>World Rules</summary>
            <div style={{ marginTop: 10, lineHeight: 1.6 }}>
              <p>
                <strong>What is this?</strong>
                <br />
                This is a real world. Everything you leave here is recorded — and irreversible.
              </p>

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

      {/* Timeline */}
      <section style={{ ...ui.card, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ margin: 0 }}>Timeline</h2>
          <button onClick={fetchRecords} style={ui.button} disabled={loadingRecords}>
            {loadingRecords ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div style={{ marginTop: 8, ...ui.small }}>
          {sortedDays.length === 0 ? "No records match your filters." : "Day 0 stays on top. Other days are newest-first."}
        </div>

        <div style={{ marginTop: 14 }}>
          {sortedDays.map((day) => (
            <div key={day} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <h3 style={{ margin: 0 }}>
                  {day === 0 ? "Day 0 (Genesis)" : `Day ${day}`}
                </h3>
                <span style={{ ...ui.small }}>{getWorldMood(day)}</span>
              </div>

              <div style={{ marginTop: 10 }}>
                {recordsByDay[day].map((r) => (
                  <div key={r.id} style={{ marginBottom: 12 }}>
                    <div style={{ whiteSpace: "pre-wrap" }}>{r.content}</div>
                    <small style={{ opacity: 0.8 }}>
                      — {r.author} · <span style={{ opacity: 0.7 }}>{new Date(r.created_at).toLocaleString()}</span>
                    </small>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Submit */}
      <section style={ui.card}>
        <h2 style={{ marginTop: 0 }}>Leave a record</h2>

        <div style={{ marginBottom: 8, opacity: 0.85 }}>
          {allowedToday
            ? "Write something you would accept being seen years from now."
            : "You have already submitted a record today (in this browser). Come back tomorrow."}
        </div>

        <div style={ui.row}>
          <div style={{ minWidth: 240 }}>
            <div style={ui.label}>Your name</div>
            <input
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              style={{ ...ui.input, width: "100%" }}
            />
          </div>

          <div style={{ minWidth: 260 }}>
            <div style={ui.label}>Safety</div>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={cooldownEnabled}
                onChange={(e) => setCooldownEnabled(e.target.checked)}
              />
              Enable 5s cooldown (anti-impulse)
            </label>
            {cooldownEnabled && cooldownLeft > 0 && (
              <div style={{ marginTop: 6, ...ui.small }}>Cooldown: {cooldownLeft}s</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={ui.label}>Record</div>
          <textarea
            placeholder="What should this world remember?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ ...ui.input, width: "100%", height: 140 }}
          />
        </div>

        {submitError && (
          <div style={{ marginTop: 10, color: "crimson" }}>
            {submitError}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button
            onClick={submitRecord}
            disabled={submitting || !allowedToday}
            style={submitting || !allowedToday ? ui.button : ui.buttonPrimary}
          >
            {submitting ? "Submitting..." : "Submit (irreversible)"}
          </button>
        </div>

        <div style={{ marginTop: 10, ...ui.small }}>
          Tip: Share filtered views using “Copy share link”.
        </div>
      </section>

      <footer style={{ marginTop: 18, ...ui.small }}>
        Built for a world where history cannot be rewritten.
      </footer>
    </main>
  );
}
