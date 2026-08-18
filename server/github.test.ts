import { afterEach, describe, expect, it, vi } from "vitest";
import { discoverProjects } from "./github";

const repository = {
  full_name: "acme/radar",
  name: "radar",
  description: "A React TypeScript contributor dashboard.",
  language: "TypeScript",
  topics: ["react", "dashboard"],
  stargazers_count: 256,
  open_issues_count: 12,
  html_url: "https://github.com/acme/radar",
};

afterEach(() => vi.unstubAllGlobals());

describe("GitHub discovery", () => {
  it("يبحث عن التسميتين ويزيل التكرار قبل ترتيب النتائج", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ items: [repository] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await discoverProjects({ skills: ["TypeScript"], interests: ["react"], experience: "مبتدئ" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual(expect.arrayContaining([
      expect.stringContaining("search/repositories?"),
      expect.stringContaining("good-first-issues%3A%3E0"),
      expect.stringContaining("help-wanted-issues%3A%3E0"),
    ]));
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ fullName: "acme/radar", difficulty: "مبتدئ" });
    expect(result[0]?.labels).toEqual(expect.arrayContaining(["good first issue", "help wanted"]));
  });
});
