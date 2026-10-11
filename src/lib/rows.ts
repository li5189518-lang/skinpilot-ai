import type { StepT } from "./schema";
export const stepsToRows = (tutorialId: string, steps: StepT[]) =>
  steps.map(s => ({ tutorial_id: tutorialId, position: s.position, title: s.title, category: s.category,
    instruction: s.instruction, caution: s.caution, timestamp_sec: s.timestamp_sec, source: s.source, optional: s.optional }));
