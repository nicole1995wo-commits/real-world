"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    []
  );

  async function submit() {
    setMsg("");
    if (!email || !password) return setMsg("请输入邮箱和密码");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: origin }
        });
        if (error) return setMsg(error.message);
        setMsg("✅ 注册成功：请去邮箱点击验证链接，然后回来登录。");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setMsg("");
    if (!email) return setMsg("先输入邮箱");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) return setMsg(error.message);
      setMsg("📩 已重新发送验证邮件（检查垃圾箱）。");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  // 未登录：奢华认证页
  if (!session) {
    return (
      <div className="min-h-screen relative bg-[#070A10] text-white overflow-hidden">
        {/* 豪华背景：多层光晕 + 噪点 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_18%_12%,rgba(120,102,255,0.25),transparent_60%),radial-gradient(900px_560px_at_82%_18%,rgba(0,210,255,0.18),transparent_60%),radial-gradient(900px_560px_at_55%_92%,rgba(255,0,160,0.12),transparent_60%)]" />
          <div
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")"
            }}
          />
        </div>

        <div className="relative grid place-items-center px-4 py-12">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_40px_140px_rgba(0,0,0,0.7)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-2xl font-semibold tracking-tight">现实世界</div>
                <div className="mt-1 text-sm text-white/60">
                  {mode === "signup" ? "邮箱验证后才可进入" : "账号密码登录（邮箱）"}
                </div>
              </div>
              <div className="h-11 w-11 rounded-2xl border border-white/10 bg-gradient-to-br from-[rgba(120,102,255,0.35)] via-[rgba(0,210,255,0.24)] to-[rgba(255,0,160,0.14)]" />
            </div>

            <div className="mt-6 space-y-3">
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 outline-none focus:border-white/20"
                placeholder="邮箱（账号）"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 outline-none focus:border-white/20"
                placeholder="密码（建议 8 位以上）"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {msg && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80">
                  {msg}
                </div>
              )}

              <button
                onClick={submit}
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500/80 via-cyan-500/70 to-fuchsia-500/60 px-4 py-2.5 font-medium disabled:opacity-60"
              >
                {loading ? "处理中…" : mode === "signup" ? "注册并发送验证邮件" : "登录进入"}
              </button>

              {mode === "login" && (
                <button
                  onClick={resend}
                  disabled={loading}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/80 hover:bg-white/[0.06] disabled:opacity-60"
                >
                  没收到验证邮件？重新发送
                </button>
              )}

              <button
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/80 hover:bg-white/[0.06]"
              >
                {mode === "signup" ? "已有账号？去登录" : "没有账号？去注册"}
              </button>

              <div className="pt-2 text-[12px] text-white/45">
                注册后请检查邮箱并点击验证链接（含垃圾箱）。
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 已登录：右上角用户条
  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80 backdrop-blur">
        <span className="max-w-[220px] truncate">{session.user.email}</span>
        <button
          onClick={logout}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1"
        >
          退出
        </button>
      </div>
      {children}
    </>
  );
}
