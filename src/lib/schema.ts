import { z } from "zod";
export const Step = z.object({
  position: z.number().int(),
  title: z.string(),
  category: z.enum(["cleanser","toner","serum","moisturizer","sunscreen","other"]),
  instruction: z.string().describe("Only what the tutorial text actually says"),
  caution: z.string().nullable(),
  timestamp_sec: z.number().int().nullable(),
  source: z.enum(["explicit","inferred"]).describe("explicit = stated in input; inferred = your guess"),
  optional: z.boolean(),
});
export const Tutorial = z.object({ title: z.string(), steps: z.array(Step).min(1).max(12) });
export type TutorialT = z.infer<typeof Tutorial>;
export type StepT = z.infer<typeof Step>;
