import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { QUIZ_SYSTEM } from "@/lib/prompt";
import { userFromRequest } from "@/lib/supabase";
export const runtime = "nodejs";
const Quiz = z.object({ questions: z.array(z.object({ q: z.string(), options: z.array(z.string()).min(3).max(3), answer: z.number().int() })).min(2).max(2) });
export async function POST(req: Request) {
  const auth = await userFromRequest(req);
  if (!auth) return NextResponse.json({ error: "login required" }, { status: 401 });
  const { tutorialId } = await req.json().catch(() => ({}));
  if (!z.string().uuid().safeParse(tutorialId).success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
  const { data, error } = await auth.db.from("tutorial_steps").select("position,title,instruction,caution").eq("tutorial_id", tutorialId).order("position");
  if (error || !data?.length) return NextResponse.json({ error: error?.message ?? "tutorial not found" }, { status: 404 });
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const r = await client.beta.chat.completions.parse({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [{ role: "system", content: QUIZ_SYSTEM }, { role: "user", content: JSON.stringify(data) }],
    response_format: zodResponseFormat(Quiz, "quiz"),
  });
  const p = r.choices[0].message.parsed;
  if (!p || p.questions.some(x => x.answer < 0 || x.answer > 2)) return NextResponse.json({ error: "quiz generation failed" }, { status: 502 });
  return NextResponse.json(p);
}
