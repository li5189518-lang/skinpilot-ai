import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { COACH_QUESTIONS, COACH_SYSTEM } from "@/lib/prompt";
import { userFromRequest } from "@/lib/supabase";
export const runtime = "nodejs";
const Body = z.object({
  kind: z.enum(["dont", "why", "skip", "noprod"]),
  step: z.object({ title: z.string(), category: z.string(), instruction: z.string(), caution: z.string().nullable(), source: z.string() }),
  sensitivity: z.enum(["none", "sometimes", "sensitive"]),
  owned: z.array(z.string()).max(10),
});
export async function POST(req: Request) {
  if (!(await userFromRequest(req))) return NextResponse.json({ error: "login required" }, { status: 401 });
  const b = Body.safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const r = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini", max_tokens: 250,
    messages: [{ role: "system", content: COACH_SYSTEM },
      { role: "user", content: `Step: ${JSON.stringify(b.data.step)}\nProfile: sensitivity=${b.data.sensitivity}, owned=${b.data.owned.join(",") || "none"}\nQuestion: ${COACH_QUESTIONS[b.data.kind]}` }],
  });
  return NextResponse.json({ answer: r.choices[0].message.content ?? "" });
}
