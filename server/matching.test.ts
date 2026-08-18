import { describe, expect, it } from "vitest";
import { inferDifficulty, matchProject, type ProjectCandidate } from "./matching";

const project: ProjectCandidate = {
  fullName: "example/radar",
  name: "radar",
  description: "A TypeScript dashboard for open source contributors.",
  language: "TypeScript",
  topics: ["react", "open-source", "dashboard"],
  stars: 820,
  openIssues: 14,
  url: "https://github.com/example/radar",
  labels: ["good first issue"],
};

describe("matching", () => {
  it("يرفع نتيجة مشروع يطابق اللغة والاهتمام ويعرض مهارة مطابقة", () => {
    const result = matchProject(project, ["TypeScript", "Python"], ["react", "security"], "مبتدئ");
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.matchingSkills).toContain("TypeScript");
    expect(result.difficulty).toBe("مبتدئ");
  });

  it("يصنف good first issue كمستوى مبتدئ", () => {
    expect(inferDifficulty(project)).toBe("مبتدئ");
  });
});
