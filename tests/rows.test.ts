import { it, expect } from "vitest";
import { stepsToRows } from "../src/lib/rows";
it("maps steps to db rows with tutorial id and keeps source", () => {
  const r = stepsToRows("abc", [{ position: 1, title: "t", category: "cleanser", instruction: "i", caution: null, timestamp_sec: null, source: "inferred", optional: false }]);
  expect(r[0]).toMatchObject({ tutorial_id: "abc", source: "inferred", position: 1 });
});
