import { it, expect } from "vitest";
import { levelFor, metrics } from "../src/lib/metrics";
it("self-report alone never counts as independent", () => expect(levelFor(true, 1, 2)).toBe("self_reported"));
it("perfect quiz without claim is quiz_passed", () => expect(levelFor(false, 2, 2)).toBe("quiz_passed"));
it("perfect quiz plus claim is independent", () => expect(levelFor(true, 2, 2)).toBe("independent"));
it("no quiz is self_reported", () => expect(levelFor(true, 0, 0)).toBe("self_reported"));
it("metrics only count independent in rate", () => {
  const m = metrics([{ completion_level: "independent", difficulties: ["a"], tutorial_id: "t1" }, { completion_level: "self_reported", difficulties: ["a", "b"], tutorial_id: "t1" }]);
  expect(m).toMatchObject({ tutorialsLearned: 1, routinesCompleted: 2, independentRate: 0.5, learningProgress: 0.5 });
  expect(m.commonDifficulties[0]).toEqual({ d: "a", c: 2 });
});
