"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<any>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit() {
    setMsg("");
    if (!email || !password) return setMsg("请输入邮箱和密码");
    setLoading(true);

    try {
      if (mode === "signup") {
        // 注册：会发送邮箱验证
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) return setMsg(error.message);

        setMsg("✅ 注册成功，请前往邮箱点击验证链接后再登录。");
        setMode("login");
      } else {
        // 登录：必须已验证邮箱
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) return setMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmEmail() {
    setMsg("");
    if (!email) return setMsg("请先输入邮箱");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email
      });
      if (error) return setMsg(error.message);
      setMsg("📩 验证邮件已重新发送，请检查邮箱或垃圾箱。");
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    await supabase.auth.signOut();
  }

  // 🔒 未登录：显示高端登录/注册页
  if (!session) {
    return (
      <div className="min-h-screen relative bg-[#070A10] text-white overflow-hidden">
        {/* 背景光晕 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_20%_15%,rgba(120,102,255,0.22),transparent_55%),radial-gradient(780px_460px_at_80%_25%,rgba(0,210,255,0.16),transparent_55%),radial-gradient(900px_520px_at_50%_90%,rgba(255,0,160,0.10),transparent_55%)]" />
        </div>

        <div className="relative grid place-items-center px-4 py-12">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
            <div className="text-2xl font-semibold tracking-tight">
              现实世界
            </div>
            <div className="mt-1 text-sm text-white/60">
              {mode === "signup"
                ? "注册后需邮箱验证"
                : "使用邮箱 + 密码登录"}
            </div>

            <div className="mt-6 space-y-3">
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 outline-none"
                placeholder="邮箱（账号）"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 outline-none"
                placeholder="密码（至少 8 位）"
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
                onClick={onSubmit}
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500/80 via-cyan-500/70 to-fuchsia-500/60 px-4 py-2.5 font-medium disabled:opacity-60"
              >
                {loading
                  ? "处理中…"
                  : mode === "signup"
                  ? "注册并发送验证邮件"
                  : "登录进入"}
              </button>

              {mode === "login" && (
                <button
                  onClick={resendConfirmEmail}
                  disabled={loading}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/80"
                >
                  没收到验证邮件？重新发送
                </button>
              )}

              <button
                onClick={() =>
                  setMode(mode === "signup" ? "login" : "signup")
                }
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/80"
              >
                {mode === "signup"
                  ? "已有账号？去登录"
                  : "没有账号？去注册"}
              </button>

              <div className="pt-2 text-[12px] text-white/45">
                注册后请检查邮箱并点击验证链接。
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ 已登录：显示页面 + 右上角账号
  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/80 backdrop-blur">
        <span className="max-w-[220px] truncate">{session.user.email}</span>
        <button
          onClick={onLogout}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-1"
        >
          退出
        </button>
      </div>
      {children}
    </>
  );
}
