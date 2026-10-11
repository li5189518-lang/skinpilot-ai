import { NextResponse } from "next/server";
import { z } from "zod";
import { userFromRequest } from "@/lib/supabase";
import { levelFor } from "@/lib/metrics";
export const runtime = "nodejs";
const Body = z.object({
  tutorialId: z.string().uuid(), title: z.string().max(200),
  plan: z.array(z.record(z.unknown())).min(1).max(12),
  claimedIndependent: z.boolean(), quizScore: z.number().int().min(0).max(10), quizTotal: z.number().int().min(0).max(10),
  difficulties: z.array(z.string().max(200)).max(10),
});
export async function POST(req: Request) {
  const auth = await userFromRequest(req);
  if (!auth) return NextResponse.json({ error: "login required" }, { status: 401 });
  const b = Body.safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { user, db } = auth;
  const r = await db.from("routines").insert({ user_id: user.id, tutorial_id: b.data.tutorialId, title: b.data.title, plan: b.data.plan }).select("id").single();
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
  const s = await db.from("practice_sessions").insert({ routine_id: r.data.id, user_id: user.id, completion_level: levelFor(b.data.claimedIndependent, b.data.quizScore, b.data.quizTotal), quiz_score: b.data.quizScore, difficulties: b.data.difficulties });
  if (s.error) return NextResponse.json({ error: s.error.message }, { status: 500 });
  return NextResponse.json({ routineId: r.data.id });
}
