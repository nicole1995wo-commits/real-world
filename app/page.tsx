"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

// --------------------
// World time settings
// --------------------
// World start (Day 0). You can change this later.
// Use UTC to keep the world's day consistent across timezones.
const WORLD_START = new Date("2025-12-20T00:00:00Z");

function getWorldDay(now = new Date()) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = now.getTime() - WORLD_START.getTime();
  return Math.max(0, Math.floor(diff / msPerDay));
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

// A1.3: One record per day (per browser)
// Keyed by world day so it resets automatically next day.
function canSubmitToday(day: number) {
  try {
    const key = `realworld:last_submit_day`;
    const v = localStorage.getItem(key);
    if (!v) return true;
    return Number(v) !== day;
  } catch {
    return true; // if storage blocked, allow
  }
}

function markSubmittedToday(day: number) {
  try {
    const key = `realworld:last_submit_day`;
    localStorage.setItem(key, String(day));
  } catch {
    // ignore
  }
}

export default function Home() {
  const todayDay = getWorldDay();

  const [records, setRecords] = useState<RecordItem[]>([]);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [allowedToday, setAllowedToday] = useState(true);

  useEffect(() => {
    fetchRecords();
    setAllowedToday(canSubmitToday(todayDay));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If day changes while user keeps page open, re-check submit allowance
  useEffect(() => {
    setAllowedToday(canSubmitToday(todayDay));
  }, [todayDay]);

  async function fetchRecords() {
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }
    if (data) setRecords(data as RecordItem[]);
  }

  async function submitRecord() {
    setSubmitError(null);

    if (!author.trim() || !content.trim()) {
      setSubmitError("Please fill in your name and a record.");
      return;
    }

    if (!allowedToday) {
      setSubmitError("You can only submit one record per day in this browser.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("records").insert({
      content: content.trim(),
      author: author.trim(),
      day: todayDay,
    });

    setLoading(false);

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

  // Group records by day
  const { sortedDays, recordsByDay } = useMemo(() => {
    const map: Record<number, RecordItem[]> = {};
    for (const r of records) {
      map[r.day] = map[r.day] || [];
      map[r.day].push(r);
    }

    // A1.2: Day 0 always first (Genesis), other days newest first
    const allDays = Object.keys(map).map(Number);
    const nonZero = allDays.filter((d) => d !== 0).sort((a, b) => b - a);
    const days = (map[0] ? [0] : []).concat(nonZero);

    return { sortedDays: days, recordsByDay: map };
  }, [records]);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8 }}>Real World</h1>

        <div style={{ marginBottom: 6 }}>
          <strong>Today:</strong> Day {todayDay}
        </div>

        <div style={{ fontStyle: "italic", opacity: 0.85 }}>
          All actions here are irreversible.
        </div>

        <details style={{ marginTop: 12 }}>
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
      </header>

      {/* Timeline */}
      <section style={{ marginBottom: 28 }}>
        {sortedDays.map((day) => (
          <div key={day} style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <h2 style={{ margin: 0 }}>
                {day === 0 ? "Day 0 (Genesis)" : `Day ${day}`}
              </h2>
              <span style={{ opacity: 0.75 }}>{getWorldMood(day)}</span>
            </div>

            <div style={{ marginTop: 10 }}>
              {recordsByDay[day].map((r) => (
                <div key={r.id} style={{ marginBottom: 12 }}>
                  <div style={{ whiteSpace: "pre-wrap" }}>{r.content}</div>
                  <small style={{ opacity: 0.8 }}>— {r.author}</small>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <hr style={{ margin: "24px 0" }} />

      {/* Submit */}
      <section>
        <h3 style={{ marginBottom: 10 }}>Leave a record</h3>

        <div style={{ marginBottom: 8, opacity: 0.85 }}>
          {allowedToday
            ? "Write something you would accept being seen years from now."
            : "You have already submitted a record today (in this browser). Come back tomorrow."}
        </div>

        <input
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{ width: 260, marginBottom: 8, padding: 6 }}
        />
        <br />

        <textarea
          placeholder="What should this world remember?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: "100%", height: 120, marginBottom: 8, padding: 8 }}
        />
        <br />

        {submitError && (
          <div style={{ marginBottom: 10, color: "crimson" }}>
            {submitError}
          </div>
        )}

        <button onClick={submitRecord} disabled={loading || !allowedToday} style={{ padding: "6px 10px" }}>
          {loading ? "Submitting..." : "Submit (irreversible)"}
        </button>
      </section>
    </main>
  );
}
