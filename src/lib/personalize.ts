import type { StepT } from "./schema";
export type Profile = { sensitivity: "none"|"sometimes"|"sensitive"; budgetAud: number; owned: string[] };
export type PlannedStep = StepT & { mode: "use_owned"|"skip"|"buy_category"; note: string };
export function personalize(steps: StepT[], p: Profile): PlannedStep[] {
  return steps.map(s => {
    if (p.owned.includes(s.category)) {
      const extra = p.sensitivity === "sensitive" && s.category === "serum" ? " Patch-test first." : "";
      return { ...s, mode: "use_owned", note: `Use your existing ${s.category}.${extra}` };
    }
    if (s.optional || s.category === "serum" || s.category === "toner")
      return { ...s, mode: "skip", note: "Optional for now; no purchase needed." };
    return { ...s, mode: "buy_category", note: `Get a gentle ${s.category} (category only; no verified price data).` };
  });
}
