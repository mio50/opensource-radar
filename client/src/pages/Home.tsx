import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowUpLeft, Bot, Check, ExternalLink, Github, Heart, Loader2, Radar, Search, SlidersHorizontal, Sparkles, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Experience = "مبتدئ" | "متوسط" | "متقدم";
type Project = {
  fullName: string; name: string; description: string; language: string | null; topics: string[]; stars: number; openIssues: number; url: string;
  labels: Array<"good first issue" | "help wanted">; score: number; difficulty: Experience; matchingSkills: string[];
};

const skillOptions = ["TypeScript", "JavaScript", "Python", "React", "Node.js", "Go", "Rust", "Java", "Flutter", "SQL", "Docker", "Security"];
const interestOptions = ["واجهة المستخدم", "البيانات", "الأمن", "DevOps", "الذكاء الاصطناعي", "أدوات المطورين"];
const experienceOptions: Experience[] = ["مبتدئ", "متوسط", "متقدم"];

function formatNumber(value: number) { return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value); }

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [skills, setSkills] = useState<string[]>(["TypeScript", "React"]);
  const [interests, setInterests] = useState<string[]>(["واجهة المستخدم", "أدوات المطورين"]);
  const [experience, setExperience] = useState<Experience>("متوسط");
  const [results, setResults] = useState<Project[]>([]);
  const [languageFilter, setLanguageFilter] = useState("الكل");
  const [difficultyFilter, setDifficultyFilter] = useState("الكل");
  const [minimumStars, setMinimumStars] = useState("0");
  const [guidance, setGuidance] = useState<Record<string, { reason: string; steps: string[]; caution: string }>>({});

  const profile = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const favorites = trpc.projects.favorites.useQuery(undefined, { enabled: isAuthenticated });
  const discover = trpc.projects.discover.useMutation({
    onSuccess: data => { setResults(data); document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }); },
    onError: error => toast.error(error.message),
  });
  const saveProfile = trpc.profile.save.useMutation();
  const toggleFavorite = trpc.projects.toggleFavorite.useMutation({ onSuccess: () => favorites.refetch(), onError: error => toast.error(error.message) });
  const explain = trpc.projects.explain.useMutation({
    onSuccess: (data, variables) => setGuidance(current => ({ ...current, [variables.project.fullName]: data })),
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (!profile.data) return;
    setSkills(profile.data.skills); setInterests(profile.data.interests); setExperience(profile.data.experience);
  }, [profile.data]);

  const languages = useMemo(() => ["الكل"].concat(Array.from(new Set(results.map(project => project.language).filter((value): value is string => Boolean(value))))), [results]);
  const favoriteNames = useMemo(() => new Set((favorites.data ?? []).map(project => project.repoFullName)), [favorites.data]);
  const filteredResults = useMemo(() => results.filter(project => (
    (languageFilter === "الكل" || project.language === languageFilter) &&
    (difficultyFilter === "الكل" || project.difficulty === difficultyFilter) &&
    project.stars >= Number(minimumStars)
  )), [results, languageFilter, difficultyFilter, minimumStars]);

  const toggle = (value: string, values: string[], setter: (next: string[]) => void) => setter(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);
  const submit = () => {
    if (!skills.length) { toast.error("اختر مهارة واحدة على الأقل لتشغيل الرادار."); return; }
    const input = { skills, interests, experience };
    discover.mutate(input);
    if (isAuthenticated) saveProfile.mutate(input);
  };
  const askForGuidance = (project: Project) => {
    if (!isAuthenticated) { toast.message("سجّل الدخول لفتح الإرشاد الذكي وحفظ مشاريعك.", { action: { label: "تسجيل الدخول", onClick: startLogin } }); return; }
    explain.mutate({ skills, interests, experience, project });
  };

  return (
    <main dir="rtl" className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="h-2 w-full bg-[#ef1f2f]" />
      <header className="container flex items-center justify-between border-b border-white/70 py-5">
        <a href="#top" className="code-font text-xl font-bold tracking-[-0.07em] sm:text-2xl">OpenSource<span className="text-[#ef1f2f]">Radar</span></a>
        <nav className="flex items-center gap-5 text-sm font-semibold">
          <a className="hidden transition-colors hover:text-[#ef1f2f] sm:block" href="#how">كيف يعمل</a>
          <a className="hidden transition-colors hover:text-[#ef1f2f] sm:block" href="#results">المشاريع</a>
          {isAuthenticated ? <span className="border border-white px-3 py-1.5 text-xs">{user?.name ?? "حسابك"}</span> : <Button onClick={startLogin} className="brutal-button h-auto bg-white px-4 py-2 text-xs font-bold text-black hover:bg-[#ef1f2f] hover:text-white">دخول / حساب</Button>}
        </nav>
      </header>

      <section id="top" className="noise-grid relative border-b border-white/70">
        <div className="container grid min-h-[530px] items-end gap-12 py-16 lg:grid-cols-[1.35fr_0.65fr] lg:py-24">
          <div className="max-w-5xl">
            <p className="code-font mb-5 text-xs font-bold tracking-[0.23em] text-[#ef1f2f]">01 — رادار المساهمة العربية</p>
            <h1 className="code-font text-[clamp(3.7rem,10vw,9.5rem)] font-bold leading-[0.79] tracking-[-0.095em]">مشروعك<br />القادم<br /><span className="text-[#ef1f2f]">يحتاجك.</span></h1>
            <p className="mt-9 max-w-xl text-base leading-8 text-white/75 sm:text-lg">نحوّل مهاراتك إلى إشارة واضحة وسط ضوضاء GitHub: مشاريع حقيقية تبحث الآن عن مساهمين، مرتبة بحسب مدى ملاءمتها لك.</p>
          </div>
          <div className="border-t-4 border-[#ef1f2f] pt-5 lg:mb-4">
            <p className="code-font text-5xl font-bold tracking-[-0.08em]">/GITHUB</p>
            <p className="mt-2 text-sm leading-7 text-white/65">البحث يستند إلى القضايا المفتوحة الموسومة بـ <span dir="ltr" className="code-font text-white">good first issue</span> و <span dir="ltr" className="code-font text-white">help wanted</span>.</p>
          </div>
        </div>
      </section>

      <section id="how" className="border-b border-white/70">
        <div className="container grid divide-y divide-white/70 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:divide-x-reverse">
          {[["01", "عرّف إشارتك", "اختر اللغات والاهتمامات ومستوى خبرتك."], ["02", "نفحص القضايا", "نلتقط المستودعات ذات فرص مساهمة مفتوحة."], ["03", "ابدأ بوضوح", "نرتب النتائج ونوضح سبب التطابق." ]].map(([number, title, copy]) => <article key={number} className="min-h-44 px-0 py-8 lg:px-8"><span className="code-font text-sm text-[#ef1f2f]">{number}</span><h2 className="mt-7 text-xl font-bold">{title}</h2><p className="mt-3 text-sm leading-7 text-white/65">{copy}</p></article>)}
        </div>
      </section>

      <section className="container grid gap-10 py-16 lg:grid-cols-[0.72fr_1.28fr] lg:py-24">
        <aside className="lg:sticky lg:top-6 lg:h-fit"><p className="code-font text-xs font-bold tracking-[0.2em] text-[#ef1f2f]">02 — بصمتك التقنية</p><h2 className="code-font mt-5 text-5xl font-bold leading-[0.9] tracking-[-0.075em]">اضبط<br />الرادار.</h2><p className="mt-7 max-w-sm leading-8 text-white/65">لا نعرض قائمة عامة. كل اختيار يغيّر ترتيب المشاريع لتصل إلى فرصة قابلة للتنفيذ.</p></aside>
        <div className="border border-white bg-[#080808] p-5 sm:p-8">
          <fieldset><legend className="field-label">لغاتك وأدواتك</legend><div className="flex flex-wrap gap-2">{skillOptions.map(skill => <button key={skill} onClick={() => toggle(skill, skills, setSkills)} className={`brutal-button border px-3 py-2 text-sm font-semibold ${skills.includes(skill) ? "border-[#ef1f2f] bg-[#ef1f2f] text-white" : "border-white/55 text-white hover:border-white"}`}>{skills.includes(skill) && <Check className="ml-1 inline size-3" />}{skill}</button>)}</div></fieldset>
          <div className="my-8 h-px bg-white/55" />
          <fieldset><legend className="field-label">مجال الاهتمام</legend><div className="flex flex-wrap gap-2">{interestOptions.map(interest => <button key={interest} onClick={() => toggle(interest, interests, setInterests)} className={`brutal-button border px-3 py-2 text-sm font-semibold ${interests.includes(interest) ? "border-white bg-white text-black" : "border-white/55 text-white hover:border-white"}`}>{interest}</button>)}</div></fieldset>
          <div className="my-8 h-px bg-white/55" />
          <fieldset><legend className="field-label">مستوى الخبرة</legend><div className="grid grid-cols-3 border border-white/55">{experienceOptions.map(level => <button key={level} onClick={() => setExperience(level)} className={`brutal-button border-l border-white/55 px-2 py-3 text-sm font-bold last:border-l-0 ${experience === level ? "bg-[#ef1f2f] text-white" : "hover:bg-white hover:text-black"}`}>{level}</button>)}</div></fieldset>
          <Button disabled={discover.isPending} onClick={submit} className="brutal-button mt-8 h-auto w-full bg-[#ef1f2f] px-5 py-4 text-base font-bold text-white hover:bg-white hover:text-black">{discover.isPending ? <><Loader2 className="ml-2 size-5 animate-spin" />جارٍ مسح GitHub…</> : <><Radar className="ml-2 size-5" />شغّل الرادار</>}</Button>
          {!isAuthenticated && <p className="mt-4 text-xs leading-6 text-white/50">يمكنك البحث دون حساب. سجّل الدخول لاحقًا لحفظ المهارات والمشاريع وإتاحة الإرشاد الذكي.</p>}
        </div>
      </section>

      <section id="results" className="border-y border-white/70 bg-[#080808] scroll-mt-4">
        <div className="container py-12 lg:py-16">
          <div className="flex flex-col justify-between gap-7 border-b border-white/70 pb-8 lg:flex-row lg:items-end"><div><p className="code-font text-xs font-bold tracking-[0.2em] text-[#ef1f2f]">03 — فرص تم رصدها</p><h2 className="code-font mt-4 text-5xl font-bold tracking-[-0.075em] sm:text-6xl">نتائجك.</h2></div>{results.length > 0 && <div className="grid grid-cols-2 gap-2 sm:flex"><div className="relative"><SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/55" /><select value={languageFilter} onChange={event => setLanguageFilter(event.target.value)} className="h-11 w-full appearance-none border border-white/55 bg-black pr-9 pl-3 text-sm"><option value="الكل">كل اللغات</option>{languages.slice(1).map(language => <option key={language} value={language}>{language}</option>)}</select></div><select value={difficultyFilter} onChange={event => setDifficultyFilter(event.target.value)} className="h-11 border border-white/55 bg-black px-3 text-sm"><option value="الكل">كل المستويات</option>{experienceOptions.map(level => <option key={level} value={level}>{level}</option>)}</select><select value={minimumStars} onChange={event => setMinimumStars(event.target.value)} className="h-11 border border-white/55 bg-black px-3 text-sm"><option value="0">أي نجوم</option><option value="100">+100 نجمة</option><option value="1000">+1K نجمة</option><option value="10000">+10K نجمة</option></select></div>}</div>
          {results.length === 0 && !discover.isPending && <div className="grid min-h-72 place-items-center border-x border-b border-white/70 p-8 text-center"><div><Search className="mx-auto size-9 text-[#ef1f2f]" /><p className="mt-5 text-xl font-bold">بانتظار إشارتك.</p><p className="mt-2 text-sm text-white/55">اختر مهاراتك ثم شغّل الرادار لرصد فرص مساهمة حية من GitHub.</p></div></div>}
          {discover.isPending && <div className="grid min-h-72 place-items-center border-x border-b border-white/70"><Loader2 className="size-8 animate-spin text-[#ef1f2f]" /></div>}
          {results.length > 0 && filteredResults.length === 0 && <div className="border-x border-b border-white/70 p-12 text-center text-white/65">لا تطابق هذه المرشحات أي فرصة الآن. جرّب توسيع نطاق البحث.</div>}
          <div className="grid lg:grid-cols-2">{filteredResults.map((project, index) => <ProjectCard key={project.fullName} project={project} index={index} isFavorite={favoriteNames.has(project.fullName)} isAuthenticated={isAuthenticated} guidance={guidance[project.fullName]} loadingGuidance={explain.isPending && explain.variables?.project.fullName === project.fullName} onFavorite={() => isAuthenticated ? toggleFavorite.mutate(project) : startLogin()} onGuidance={() => askForGuidance(project)} />)}</div>
        </div>
      </section>

      <footer className="container flex flex-col justify-between gap-5 py-8 text-xs text-white/55 sm:flex-row sm:items-center"><p className="code-font">OpenSource Radar — for Arabic builders.</p><a className="flex items-center gap-2 hover:text-white" href="https://github.com" target="_blank" rel="noreferrer"><Github className="size-4" /> البيانات عبر GitHub</a></footer>
    </main>
  );
}

function ProjectCard({ project, index, isFavorite, isAuthenticated, guidance, loadingGuidance, onFavorite, onGuidance }: { project: Project; index: number; isFavorite: boolean; isAuthenticated: boolean; guidance?: { reason: string; steps: string[]; caution: string }; loadingGuidance: boolean; onFavorite: () => void; onGuidance: () => void }) {
  return <article className="group flex flex-col border-x border-b border-white/70 p-5 transition-colors hover:bg-[#101010] sm:p-7"><div className="flex items-start justify-between gap-5"><span className="code-font text-sm text-[#ef1f2f]">{String(index + 1).padStart(2, "0")}</span><div className="flex gap-2"><span className="border border-white/55 px-2 py-1 text-[11px] font-bold">{project.difficulty}</span><button aria-label={isFavorite ? "إزالة من المفضلة" : "حفظ في المفضلة"} onClick={onFavorite} className={`brutal-button grid size-7 place-items-center border ${isFavorite ? "border-[#ef1f2f] bg-[#ef1f2f]" : "border-white/55 hover:border-white"}`}><Heart className={`size-3.5 ${isFavorite ? "fill-current" : ""}`} /></button></div></div><div className="mt-10"><p className="code-font text-xs text-white/45">{project.fullName}</p><h3 className="code-font mt-2 text-3xl font-bold tracking-[-0.065em]">{project.name}</h3><p className="mt-4 min-h-14 text-sm leading-7 text-white/65">{project.description}</p></div><div className="mt-7 flex flex-wrap gap-2">{project.matchingSkills.slice(0, 3).map(skill => <span key={skill} className="border border-[#ef1f2f] px-2 py-1 text-xs text-[#ff6974]">{skill}</span>)}{project.labels.map(label => <span key={label} dir="ltr" className="border border-white/35 px-2 py-1 text-xs text-white/65">{label}</span>)}</div><div className="mt-7 grid grid-cols-4 border-y border-white/35 py-4 text-center"><Stat label="التطابق" value={`${project.score}%`} red /><Stat label="اللغة" value={project.language ?? "—"} /><Stat label="نجوم" value={formatNumber(project.stars)} icon={<Star className="inline size-3" />} /><Stat label="قضايا" value={formatNumber(project.openIssues)} /></div><div className="mt-6 flex flex-wrap gap-3"><a href={project.url} target="_blank" rel="noreferrer" className="brutal-button inline-flex items-center gap-2 border border-white bg-white px-3 py-2.5 text-sm font-bold text-black hover:bg-[#ef1f2f] hover:text-white">افتح المشروع <ExternalLink className="size-4" /></a><button onClick={onGuidance} disabled={loadingGuidance} className="brutal-button inline-flex items-center gap-2 border border-white/55 px-3 py-2.5 text-sm font-bold hover:border-white hover:bg-white hover:text-black">{loadingGuidance ? <Loader2 className="size-4 animate-spin" /> : <Bot className="size-4" />}{isAuthenticated ? "حلّل طريق البدء" : "حلّل طريق البدء"}</button></div>{guidance && <div className="mt-6 border-r-4 border-[#ef1f2f] bg-black p-4 text-sm"><div className="flex items-center gap-2 font-bold"><Sparkles className="size-4 text-[#ef1f2f]" />سبب التناسب</div><p className="mt-2 leading-7 text-white/75">{guidance.reason}</p><ol className="mt-3 list-decimal space-y-1 pr-5 text-white/65">{guidance.steps.map(step => <li key={step}>{step}</li>)}</ol><p className="mt-3 text-xs leading-6 text-[#ff6974]">تنبيه: {guidance.caution}</p></div>}</article>;
}

function Stat({ label, value, icon, red }: { label: string; value: string; icon?: React.ReactNode; red?: boolean }) { return <div className="min-w-0 border-l border-white/20 px-1 first:border-l-0"><p className={`truncate text-xs font-bold ${red ? "text-[#ef1f2f]" : "text-white"}`}>{icon}{value}</p><p className="mt-1 text-[10px] text-white/45">{label}</p></div>; }
