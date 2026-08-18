export type ExperienceLevel = "مبتدئ" | "متوسط" | "متقدم";

export type ContributionLabel = "good first issue" | "help wanted";

export type ProjectCandidate = {
  fullName: string;
  name: string;
  description: string;
  language: string | null;
  topics: string[];
  stars: number;
  openIssues: number;
  url: string;
  labels: ContributionLabel[];
};

export type MatchedProject = ProjectCandidate & {
  score: number;
  difficulty: ExperienceLevel;
  matchingSkills: string[];
};

const normalize = (value: string) => value.trim().toLocaleLowerCase("en-US");

function includesTerm(text: string, term: string) {
  const normalizedTerm = normalize(term);
  return normalizedTerm.length > 1 && normalize(text).includes(normalizedTerm);
}

export function inferDifficulty(project: ProjectCandidate): ExperienceLevel {
  if (project.labels.includes("good first issue")) return "مبتدئ";
  if (project.labels.includes("help wanted") && project.stars < 20000) return "متوسط";
  return "متقدم";
}

export function matchProject(
  project: ProjectCandidate,
  skills: string[],
  interests: string[],
  experience: ExperienceLevel,
): MatchedProject {
  const searchable = [project.language ?? "", ...project.topics, project.description].join(" ");
  const matchingSkills = skills.filter(skill => includesTerm(searchable, skill));
  const matchingInterests = interests.filter(interest => includesTerm(searchable, interest));
  const difficulty = inferDifficulty(project);

  const languageMatch = project.language !== null && skills.some(skill => normalize(skill) === normalize(project.language as string)) ? 44 : 0;
  const skillScore = Math.min(24, matchingSkills.length * 12);
  const interestScore = Math.min(18, matchingInterests.length * 9);
  const contributionScore = project.labels.includes("good first issue") ? 10 : 6;
  const experienceScore = difficulty === experience ? 8 : difficulty === "مبتدئ" && experience !== "مبتدئ" ? 5 : 2;
  const activityScore = project.openIssues > 0 ? 3 : 0;

  return {
    ...project,
    difficulty,
    matchingSkills,
    score: Math.min(99, Math.max(8, languageMatch + skillScore + interestScore + contributionScore + experienceScore + activityScore)),
  };
}
