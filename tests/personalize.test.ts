import { describe, it, expect } from "vitest";
import { personalize } from "../src/lib/personalize";
import { Tutorial } from "../src/lib/schema";
const step = (category: any, optional = false) => ({ position: 1, title: "t", category, instruction: "i", caution: null, timestamp_sec: null, source: "explicit" as const, optional });
describe("personalize", () => {
  it("uses owned product", () => expect(personalize([step("cleanser")], { sensitivity: "none", budgetAud: 30, owned: ["cleanser"] })[0].mode).toBe("use_owned"));
  it("skips serum when not owned", () => expect(personalize([step("serum")], { sensitivity: "none", budgetAud: 30, owned: [] })[0].mode).toBe("skip"));
  it("suggests category for missing moisturizer", () => expect(personalize([step("moisturizer")], { sensitivity: "none", budgetAud: 30, owned: [] })[0].mode).toBe("buy_category"));
  it("schema rejects empty steps", () => expect(Tutorial.safeParse({ title: "x", steps: [] }).success).toBe(false));
});
