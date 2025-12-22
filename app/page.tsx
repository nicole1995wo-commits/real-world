"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

// World start (Day 0). UTC keeps the day consistent globally.
const WORLD_START = new Date("2025-12-20T00:00:00Z");

function getWorldDay(now = new Date()) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = now.getTime() - WORLD_START.getTime();
  return Math.max(0, Math.floor(diff / msPerDay));
}

function mood(day: number) {
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

// anti-spam (client)
const MIN_CHARS = 12;
const MIN_INTERVAL_SECONDS = 60;
const COOLDOWN_SECONDS = 5;

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
function normalizeText(s: string) {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}
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

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export default function Home() {
  const todayDay = getWorldDay();

  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [onlyToday, setOnlyToday] = useState(false);
  const [onlyGenesis, setOnlyGenesis] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);
  const [daysToRender, setDaysToRender] = useState(14);

  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [allowedToday, setAllowedToday] = useState(true);

  const [cooldownEnabled, setCooldownEnabled] = useState(true);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownTimer = useRef<number | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState<{ title: string; msg: string } | null>(null);
  const toastTimer = useRef<number | null>(null);

  function showToast(title: string, msg: string) {
    setToast({ title, msg });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    fetchRecords();
    setAllowedToday(canSubmitToday(todayDay));
    return () => {
      if (cooldownTimer.current) window.clearInterval(cooldownTimer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAllowedToday(canSubmitToday(todayDay));
  }, [todayDay]);

  async function fetchRecords() {
    setLoadingRecords(true);
    const { data, error } = await supabase.from("records").select("*").order("created_at", { ascending: true });
    setLoadingRecords(false);
    if (error) {
      console.error(error);
      showToast("Load failed", "Cannot fetch records. Check Supabase/RLS.");
      return;
    }
    setRecords((data || []) as RecordItem[]);
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
    if (honeypot.trim()) return showToast("Blocked", "Submission blocked.");
    if (!author.trim() || !content.trim()) return showToast("Missing", "Please fill your name and record.");
    if (content.trim().length < MIN_CHARS) return showToast("Too short", `Minimum ${MIN_CHARS} characters.`);
    if (!allowedToday) return showToast("Daily limit", "You already submitted today (this browser).");
    if (!canSubmitByInterval()) return showToast("Slow down", `Wait ${MIN_INTERVAL_SECONDS}s between submissions.`);
    if (isDuplicateToday(todayDay, content)) return showToast("Duplicate", "Same day, same content detected.");
    if (cooldownEnabled && cooldownLeft > 0) return showToast("Cooldown", `Wait ${cooldownLeft}s.`);

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
      showToast("Submit failed", "Try again.");
      return;
    }

    markSubmittedToday(todayDay);
    markSubmitTimestamp();
    markDuplicateToday(todayDay, content);
    setAllowedToday(false);
    setContent("");
    showToast("Recorded", "Your action has become part of the world.");
    await fetchRecords();
  }

  function resetFilters() {
    setSearch("");
    setDayFilter("");
    setAuthorFilter("");
    setOnlyToday(false);
    setOnlyGenesis(false);
    setSortNewest(true);
    setDaysToRender(14);
  }

  async function copyShareLink() {
    await navigator.clipboard.writeText(window.location.href);
    showToast("Copied", "Share link copied.");
  }

  const filteredRecords = useMemo(() => {
    let list = [...records];

    // sort
    list.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sortNewest ? tb - ta : ta - tb;
    });

    const s = search.trim().toLowerCase();
    if (s) list = list.filter((r) => r.content.toLowerCase().includes(s) || r.author.toLowerCase().includes(s) || String(r.day).includes(s));

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
  }, [records, search, authorFilter, onlyGenesis, onlyToday, dayFilter, sortNewest, todayDay]);

  const stats = useMemo(() => {
    const total = records.length;
    const todayCount = records.filter((r) => r.day === todayDay).length;
    const authors = new Set(records.map((r) => r.author.trim()).filter(Boolean)).size;
    return { total, todayCount, authors };
  }, [records, todayDay]);

  const { recordsByDay, sortedDaysRendered, hasMoreDays } = useMemo(() => {
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
    return { recordsByDay: map, sortedDaysRendered: rendered, hasMoreDays: rendered.length < allSorted.length };
  }, [filteredRecords, daysToRender]);

  return (
    <div className="container">
      <div className="nav">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1>现实世界</h1>
            <p>今天：第 {todayDay} 天 · 世界开始时间：{WORLD_START.toISOString().slice(0,19).replace("T"," ")} UTC</p>
          </div>
        </div>
        <div className="pills">
          <span className="pill">总记录 {stats.total}</span>
          <span className="pill">今天 {stats.todayCount}</span>
          <span className="pill">作者 {stats.authors}</span>
          <button className="btn btnGhost" onClick={copyShareLink}>复制分享链接</button>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="grid">
        {/* Left: timeline */}
        <div className="card">
          <div className="cardHeader">
            <div>
              <p className="cardTitle">时间线</p>
              <p className="cardValue">Timeline</p>
            </div>
            <div className="toolbar">
              <select className="select" value={String(daysToRender)} onChange={(e) => setDaysToRender(Number(e.target.value))}>
                <option value="7">渲染 7 天</option>
                <option value="14">渲染 14 天</option>
                <option value="30">渲染 30 天</option>
                <option value="9999">全部</option>
              </select>
              <button className="btn" onClick={fetchRecords} disabled={loadingRecords}>
                {loadingRecords ? "刷新中…" : "刷新"}
              </button>
            </div>
          </div>
          <div className="cardBody">
            <div className="toolbar" style={{ marginBottom: 10 }}>
              <input className="input" style={{ minWidth: 220 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索：内容/作者" />
              <input className="input" style={{ width: 120 }} value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} placeholder="过滤日：如 0, 1" />
              <input className="input" style={{ width: 160 }} value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)} placeholder="筛选作者（精确）" />
              <button className="btn" onClick={() => setOnlyToday(v => !v)}>今天</button>
              <button className="btn" onClick={() => setOnlyGenesis(v => !v)}>创世纪</button>
              <button className="btn" onClick={() => setSortNewest(v => !v)}>{sortNewest ? "最新" : "最老"}</button>
              <button className="btn" onClick={resetFilters}>重置</button>
            </div>

            <details>
              <summary className="btn" style={{ display: "inline-block" }}>世界规则</summary>
              <div style={{ marginTop: 10, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>
                <p><b>这是什么？</b><br/>这是一个真实的世界。你在这里留下的一切都会被记录，并且不可逆。</p>
                <p><b>三条宪法</b></p>
                <ol>
                  <li><b>不可撤回：</b>提交之后，无法修改或删除。</li>
                  <li><b>只看行为：</b>不关心你是谁，只关心你做了什么。</li>
                  <li><b>影响即存在：</b>唯一重要的是，你是否真的改变了这个世界。</li>
                </ol>
                <p><b>如果你犹豫——先别写。</b></p>
              </div>
            </details>

            <hr className="hr" />

            {hasMoreDays && (
              <div className="entry" style={{ marginTop: 0 }}>
                <div className="entryMeta">提示：更多天存在但未渲染。可把“渲染天数”调大。</div>
              </div>
            )}

            {sortedDaysRendered.map((day) => (
              <div key={day} className="dayBlock">
                <div className="dayHead">
                  <h3 className="dayTitle">{day === 0 ? "第0天（创世纪）" : `第${day}天`}</h3>
                  <p className="daySub">{mood(day)}</p>
                </div>

                {(recordsByDay[day] || []).map((r) => (
                  <div key={r.id} className="entry">
                    <div className="entryTop">
                      <span className="badge">Day {r.day}</span>
                      <span className="entryMeta">{formatTime(r.created_at)}</span>
                    </div>
                    <p className="entryText">{r.content}</p>
                    <div className="entryMeta">
                      — <button className="btnGhost" style={{ border: "none", color: "rgba(255,255,255,0.86)", cursor: "pointer", textDecoration: "underline" }} onClick={() => setAuthorFilter(r.author)}>{r.author}</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right: submit */}
        <div className="card">
          <div className="cardHeader">
            <div>
              <p className="cardTitle">留下记录</p>
              <p className="cardValue">Write</p>
            </div>
            <span className="badge">最少 {MIN_CHARS} 字 · 间隔 {MIN_INTERVAL_SECONDS}s</span>
          </div>
          <div className="cardBody">
            <p style={{ marginTop: 0, color: "rgba(255,255,255,0.72)" }}>
              写一段你愿意多年以后仍然被看见的文字。（不可撤回）
            </p>

            {/* honeypot */}
            <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

            <div style={{ display: "grid", gap: 10 }}>
              <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="你的名字（作者）" />
              <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)} placeholder="这个世界应该记住什么？" />

              <label style={{ display: "flex", gap: 8, alignItems: "center", color: "rgba(255,255,255,0.72)", fontSize: 12 }}>
                <input type="checkbox" checked={cooldownEnabled} onChange={(e) => setCooldownEnabled(e.target.checked)} />
                启用 5 秒冷静时间（防冲动）
                {cooldownEnabled && cooldownLeft > 0 ? <span> · 冷静：{cooldownLeft}s</span> : null}
              </label>

              <button className="btn btnPrimary" onClick={submitRecord} disabled={submitting || !allowedToday}>
                {submitting ? "提交中…" : allowedToday ? "提交（不可逆）" : "今天已提交（明天再来）"}
              </button>

              <p style={{ margin: 0, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                Tip：点击作者名可筛选；通过“复制分享链接”分享当前视图。
              </p>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <p className="toastTitle">{toast.title}</p>
          <p className="toastMsg">{toast.msg}</p>
        </div>
      )}
    </div>
  );
}
