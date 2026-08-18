import { type ContributionLabel, matchProject, type ExperienceLevel, type MatchedProject, type ProjectCandidate } from "./matching";

type GitHubRepository = {
  full_name?: string;
  name?: string;
  description?: string | null;
  language?: string | null;
  topics?: string[];
  stargazers_count?: number;
  open_issues_count?: number;
  html_url?: string;
};

type GitHubSearchResponse = { items?: GitHubRepository[]; message?: string };

const ACCEPTED_LABELS: ContributionLabel[] = ["good first issue", "help wanted"];

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2026-03-10",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function searchRepositories(label: ContributionLabel): Promise<ProjectCandidate[]> {
  const contributionQualifier = label === "good first issue" ? "good-first-issues:>0" : "help-wanted-issues:>0";
  const params = new URLSearchParams({
    q: `${contributionQualifier} archived:false`,
    sort: "updated",
    order: "desc",
    per_page: "30",
  });
  const response = await fetch(`https://api.github.com/search/repositories?${params.toString()}`, {
    headers: githubHeaders(),
  });
  const payload = (await response.json()) as GitHubSearchResponse;
  if (!response.ok) {
    const detail = response.status === 403 ? "تم بلوغ حد GitHub المؤقت. حاول مجددًا بعد قليل." : "تعذر الوصول إلى GitHub في هذه اللحظة.";
    throw new Error(detail + (payload.message ? ` ${payload.message}` : ""));
  }
  return (payload.items ?? []).map(repository => toCandidate(repository, label)).filter((candidate): candidate is ProjectCandidate => Boolean(candidate));
}

function toCandidate(repository: GitHubRepository, label: ContributionLabel): ProjectCandidate | null {
  if (!repository.full_name || !repository.name || !repository.html_url) return null;

  return {
    fullName: repository.full_name,
    name: repository.name,
    description: repository.description ?? "لا يتوفر وصف للمشروع في GitHub.",
    language: repository.language ?? null,
    topics: repository.topics ?? [],
    stars: repository.stargazers_count ?? 0,
    openIssues: repository.open_issues_count ?? 0,
    url: repository.html_url,
    labels: [label],
  };
}

export async function discoverProjects(input: {
  skills: string[];
  interests: string[];
  experience: ExperienceLevel;
}): Promise<MatchedProject[]> {
  const repositoryGroups = await Promise.all(ACCEPTED_LABELS.map(searchRepositories));
  const candidates = new Map<string, ProjectCandidate>();

  repositoryGroups.flat().forEach(candidate => {
    const existing = candidates.get(candidate.fullName);
    candidates.set(candidate.fullName, existing ? { ...existing, labels: Array.from(new Set(existing.labels.concat(candidate.labels))) } : candidate);
  });

  return Array.from(candidates.values())
    .map(project => matchProject(project, input.skills, input.interests, input.experience))
    .sort((a, b) => b.score - a.score || b.stars - a.stars);
}
