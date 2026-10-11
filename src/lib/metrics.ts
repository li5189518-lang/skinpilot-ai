export type Level = "self_reported" | "quiz_passed" | "independent";
// quiz_passed needs a perfect score; independent needs that AND the user's own claim of doing it unaided.
export const levelFor = (claimedIndependent: boolean, score: number, total: number): Level =>
  total > 0 && score === total ? (claimedIndependent ? "independent" : "quiz_passed") : "self_reported";
export type Row = { completion_level: Level; difficulties: string[] | null; tutorial_id: string | null };
export function metrics(rows: Row[]) {
  const n = rows.length, count = (l: Level) => rows.filter(r => r.completion_level === l).length;
  const freq = new Map<string, number>();
  rows.forEach(r => (r.difficulties ?? []).forEach(d => freq.set(d, (freq.get(d) ?? 0) + 1)));
  return {
    tutorialsLearned: new Set(rows.map(r => r.tutorial_id).filter(Boolean)).size,
    routinesCompleted: n,
    independentRate: n ? count("independent") / n : 0,
    learningProgress: n ? (count("quiz_passed") + count("independent")) / n : 0,
    commonDifficulties: [...freq].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([d, c]) => ({ d, c })),
  };
}
