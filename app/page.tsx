"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// World start (Day 0). You can change this later.
const WORLD_START = new Date("2025-12-20T00:00:00Z");

function getWorldDay(now = new Date()) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = now.getTime() - WORLD_START.getTime();
  return Math.max(0, Math.floor(diff / msPerDay));
}

type RecordItem = {
  id: string;
  content: string;
  author: string;
  day: number;
  created_at: string;
};

export default function Home() {
  const todayDay = getWorldDay();

  const [records, setRecords] = useState<RecordItem[]>([]);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

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
    if (!content.trim() || !author.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("records").insert({
      content: content.trim(),
      author: author.trim(),
      day: todayDay,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Submit failed. Please try again.");
      return;
    }

    setContent("");
    await fetchRecords();
  }

  return (
    <main>
      <h1>Real World</h1>

      <p>
        <strong>Today:</strong> Day {todayDay}
      </p>

      <p>
        <em>All actions here are irreversible.</em>
      </p>

      <details style={{ marginBottom: 16 }}>
        <summary style={{ cursor: "pointer" }}>World Rules</summary>
        <div style={{ marginTop: 8, lineHeight: 1.6 }}>
          <p>
            <strong>What is this?</strong>
            <br />
            This is a real world. Everything you leave here is recorded — and
            irreversible.
          </p>

          <p>
            <strong>Three Laws</strong>
          </p>
          <ol>
            <li>
              <strong>No take-backs:</strong> Once submitted, it cannot be edited
              or deleted.
            </li>
            <li>
              <strong>Only actions matter:</strong> Not who you are — what you do.
            </li>
            <li>
              <strong>Impact is existence:</strong> The only thing that matters is
              whether you truly changed this world.
            </li>
          </ol>

          <p>
            <strong>If you hesitate — don’t write yet.</strong>
          </p>
        </div>
      </details>

      <section style={{ marginBottom: 24 }}>
        {records.map((r) => (
          <div key={r.id} style={{ marginBottom: 16 }}>
            <div>{r.content}</div>
            <small>
              — {r.author}, Day {r.day}
            </small>
          </div>
        ))}
      </section>

      <hr />

      <section>
        <h3>Leave a record</h3>

        <input
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <br />

        <textarea
          placeholder="What should this world remember?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: "100%", height: 80, marginBottom: 8 }}
        />
        <br />

        <button onClick={submitRecord} disabled={loading}>
          {loading ? "Submitting..." : "Submit (irreversible)"}
        </button>
      </section>
    </main>
  );
}
