"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type RecordItem = {
  id: string;
  content: string;
  author: string;
  day: number;
  created_at: string;
};

export default function Home() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    const { data } = await supabase
      .from("records")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) setRecords(data);
  }

  async function submitRecord() {
    if (!content || !author) return;

    await supabase.from("records").insert({
      content,
      author,
      day: 0,
    });

    setContent("");
    fetchRecords();
  }

  return (
    <main>
      <h1>Real World</h1>
      <p><em>All actions here are irreversible.</em></p>
<details style={{ marginBottom: 16 }}>
  <summary style={{ cursor: "pointer" }}>World Rules</summary>
  <div style={{ marginTop: 8, lineHeight: 1.6 }}>
    <p><strong>What is this?</strong><br />
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

      <section>
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
        />
        <br />
        <textarea
          placeholder="What should this world remember?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <br />
        <button onClick={submitRecord}>Submit (irreversible)</button>
      </section>
    </main>
  );
}
