import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { Tutorial } from "@/lib/schema";
import { PARSE_SYSTEM } from "@/lib/prompt";
import { userFromRequest } from "@/lib/supabase";
import { stepsToRows } from "@/lib/rows";
export const runtime = "nodejs";
const MAX_CHARS = 8000;
export async function POST(req: Request) {
  const auth = await userFromRequest(req);
  if (!auth) return NextResponse.json({ error: "login required" }, { status: 401 });
  const { text } = await req.json().catch(() => ({ text: "" }));
  if (typeof text !== "string" || text.trim().length < 20 || text.length > MAX_CHARS)
    return NextResponse.json({ error: `text must be 20-${MAX_CHARS} chars` }, { status: 400 });
  if (!process.env.OPENAI_API_KEY)
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const r = await client.beta.chat.completions.parse({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [{ role: "system", content: PARSE_SYSTEM }, { role: "user", content: text }],
    response_format: zodResponseFormat(Tutorial, "tutorial"),
  });
  const parsed = r.choices[0].message.parsed;
  if (!parsed) return NextResponse.json({ error: "parse failed" }, { status: 502 });
  const { user, db } = auth;
  const p = await db.from("profiles").upsert({ id: user.id });
  if (p.error) return NextResponse.json({ error: p.error.message }, { status: 500 });
  const t = await db.from("tutorials").insert({ user_id: user.id, title: parsed.title, source_type: "text", raw_input: text }).select("id").single();
  if (t.error) return NextResponse.json({ error: t.error.message }, { status: 500 });
  const st = await db.from("tutorial_steps").insert(stepsToRows(t.data.id, parsed.steps));
  if (st.error) return NextResponse.json({ error: st.error.message }, { status: 500 });
  return NextResponse.json({ id: t.data.id, ...parsed });
}
