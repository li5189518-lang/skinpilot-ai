"use client";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { TutorialT } from "@/lib/schema";
import { browserClient } from "@/lib/supabase";
export default function Home() {
  const sb = useMemo(() => browserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  const [text, setText] = useState(""); const [t, setT] = useState<TutorialT | null>(null);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);
  async function login() {
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    error ? setErr(error.message) : setSent(true);
  }
  async function run() {
    setBusy(true); setErr("");
    const r = await fetch("/api/parse", { method: "POST", headers: { Authorization: `Bearer ${session!.access_token}` }, body: JSON.stringify({ text }) });
    const j = await r.json(); setBusy(false);
    r.ok ? setT(j) : setErr(j.error);
  }
  if (!session) return <main>
    <h1>SkinPilot AI</h1>
    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="邮箱" />
    <button onClick={login}>发送登录链接</button>
    {sent && <p>已发送，请查收邮件。</p>}{err && <p role="alert">{err}</p>}
  </main>;
  return <main>
    <h1>SkinPilot AI</h1>
    <textarea rows={6} style={{ width: "100%" }} value={text} onChange={e => setText(e.target.value)} placeholder="粘贴教程文字（至少 20 字）" />
    <button onClick={run} disabled={busy}>{busy ? "解析中…" : "解析并保存"}</button>
    <button onClick={() => sb.auth.signOut()}>退出</button> <a href="/dashboard">学习进度</a>
    {err && <p role="alert">{err}</p>}
    {t && (t as TutorialT & { id?: string }).id && <p><a href={`/practice/${(t as TutorialT & { id?: string }).id}`}>开始跟练</a></p>}
    {t && <ol>{t.steps.map(s => <li key={s.position}><b>{s.title}</b> [{s.source === "explicit" ? "明确" : "AI 推断"}]<br />{s.instruction}</li>)}</ol>}
  </main>;
}
