"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { browserClient } from "@/lib/supabase";
import { personalize, type PlannedStep, type Profile } from "@/lib/personalize";
import type { StepT } from "@/lib/schema";
const CATS = ["cleanser", "toner", "serum", "moisturizer", "sunscreen"];
const Q = { dont: "我没看懂", why: "为什么要这步？", skip: "可以跳过吗？", noprod: "没有这个产品？" } as const;
export default function Practice() {
  const { id } = useParams<{ id: string }>();
  const sb = useMemo(() => browserClient(), []);
  const [steps, setSteps] = useState<StepT[]>([]);
  const [token, setToken] = useState("");
  const [sens, setSens] = useState<Profile["sensitivity"]>("none");
  const [owned, setOwned] = useState<string[]>([]);
  const [plan, setPlan] = useState<PlannedStep[] | null>(null);
  const [i, setI] = useState(0); const [sec, setSec] = useState(0);
  const [ans, setAns] = useState(""); const [diff, setDiff] = useState<string[]>([]);
  const [level, setLevel] = useState<"self_reported" | "independent">("self_reported");
  const [msg, setMsg] = useState("");
  const [qz, setQz] = useState<{ q: string; options: string[]; answer: number }[] | null>(null);
  const [pk, setPk] = useState<number[]>([]);
  const finished = !!plan && i >= plan.length;
  const score = () => (qz ? qz.filter((x, k) => pk[k] === x.answer).length : 0);
  useEffect(() => {
    if (!finished || qz || !token) return;
    (async () => {
      const r = await fetch("/api/quiz", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ tutorialId: id }) });
      const j = await r.json(); r.ok ? setQz(j.questions) : setMsg(j.error);
    })();
  }, [finished, qz, token, id]);
  useEffect(() => {
    (async () => {
      const { data: s } = await sb.auth.getSession();
      if (!s.session) { setMsg("请先登录"); return; }
      setToken(s.session.access_token);
      const { data, error } = await sb.from("tutorial_steps").select("*").eq("tutorial_id", id).order("position");
      error ? setMsg(error.message) : setSteps(data as StepT[]);
    })();
  }, [sb, id]);
  useEffect(() => { const t = setInterval(() => setSec(x => x + 1), 1000); return () => clearInterval(t); }, [i]);
  const post = (url: string, body: unknown) => fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  async function ask(kind: keyof typeof Q) {
    const s = plan![i]; setAns("…");
    if (kind === "dont") setDiff(d => [...d, `看不懂：${s.title}`]);
    const r = await post("/api/coach", { kind, step: { title: s.title, category: s.category, instruction: s.instruction, caution: s.caution, source: s.source }, sensitivity: sens, owned });
    const j = await r.json(); setAns(r.ok ? j.answer : j.error);
  }
  async function done() {
    const r = await post("/api/sessions", { tutorialId: id, title: "My routine", plan, claimedIndependent: level === "independent", quizScore: score(), quizTotal: qz?.length ?? 0, difficulties: diff });
    setMsg(r.ok ? "已保存到你的流程" : (await r.json()).error);
  }
  if (!steps.length) return <main><p>{msg || "加载中…"}</p></main>;
  if (!plan) return <main>
    <h1>开始前</h1>
    <p>敏感程度：{(["none", "sometimes", "sensitive"] as const).map(x => <button key={x} aria-pressed={sens === x} onClick={() => setSens(x)}>{x}</button>)}</p>
    <p>已有产品：{CATS.map(c => <button key={c} aria-pressed={owned.includes(c)} onClick={() => setOwned(o => o.includes(c) ? o.filter(y => y !== c) : [...o, c])}>{c}</button>)}</p>
    <button onClick={() => setPlan(personalize(steps, { sensitivity: sens, budgetAud: 0, owned }))}>生成我的方案</button>
  </main>;
  if (i >= plan.length) {
    const answered = !!qz && pk.filter(x => x !== undefined).length === qz.length;
    return <main>
      <h1>快速检验</h1>
      {!qz && <p>{msg || "正在生成题目…"}</p>}
      {qz?.map((x, k) => <div key={k}><p><b>{x.q}</b></p>{x.options.map((o, j) => <button key={j} aria-pressed={pk[k] === j} onClick={() => setPk(p => { const c = [...p]; c[k] = j; return c; })}>{o}</button>)}</div>)}
      {answered && <>
        <p>答对 {score()} / {qz!.length}。点击完成不等于掌握，请如实选择：</p>
        <button aria-pressed={level === "self_reported"} onClick={() => setLevel("self_reported")}>照着教程做的</button>
        <button aria-pressed={level === "independent"} onClick={() => setLevel("independent")}>不看教程独立完成</button>
        <p><button onClick={done}>保存流程</button></p>{msg && <p role="status">{msg}</p>}
      </>}
    </main>;
  }
  const s = plan[i];
  return <main>
    <p>第 {i + 1}/{plan.length} 步 · {String(Math.floor(sec / 60)).padStart(2, "0")}:{String(sec % 60).padStart(2, "0")}</p>
    <h1>{s.title}</h1><p>{s.instruction}</p>
    {s.caution && <p>注意：{s.caution}</p>}<p><i>{s.note}</i></p>
    <p>{(Object.keys(Q) as (keyof typeof Q)[]).map(k => <button key={k} onClick={() => ask(k)}>{Q[k]}</button>)}</p>
    {ans && <p role="status"><small>AI 回答（未接入知识库，不含文献来源）</small><br />{ans}</p>}
    <button onClick={() => { setI(i + 1); setSec(0); setAns(""); }}>我做完了</button>
  </main>;
}
