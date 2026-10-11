"use client";
import { useEffect, useMemo, useState } from "react";
import { browserClient } from "@/lib/supabase";
import { metrics, type Row } from "@/lib/metrics";
export default function Dashboard() {
  const sb = useMemo(() => browserClient(), []);
  const [m, setM] = useState<ReturnType<typeof metrics> | null>(null); const [err, setErr] = useState("");
  useEffect(() => {
    (async () => {
      const { data, error } = await sb.from("practice_sessions").select("completion_level,difficulties,routines(tutorial_id)");
      if (error) return setErr(error.message);
      setM(metrics((data as any[]).map(r => ({ completion_level: r.completion_level, difficulties: r.difficulties, tutorial_id: r.routines?.tutorial_id ?? null })) as Row[]));
    })();
  }, [sb]);
  if (err) return <main><p role="alert">{err}</p></main>;
  if (!m) return <main><p>加载中…</p></main>;
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  return <main>
    <h1>学习进度</h1>
    <p>Tutorials Learned：{m.tutorialsLearned}</p><p>Routines Completed：{m.routinesCompleted}</p>
    <p>Independent Completion Rate：{pct(m.independentRate)}</p><p>Learning Progress：{pct(m.learningProgress)}</p>
    <h2>Common Difficulties</h2>{m.commonDifficulties.length ? <ul>{m.commonDifficulties.map(x => <li key={x.d}>{x.d}（{x.c}）</li>)}</ul> : <p>暂无记录</p>}
    <p><small>独立完成 = 测试全对 + 你自己确认未看教程。仅自报完成不计入。</small></p>
    <a href="/">返回</a>
  </main>;
}
