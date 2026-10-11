import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const browserClient = () => createClient(url, anon);
// Server: client acts AS the user (anon key + user JWT), so RLS applies. No service-role key needed here.
export async function userFromRequest(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return null;
  const db = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  return { user: data.user, db };
}
