import type { Course } from "@/lib/types";

export function mapStoredCourseToClient(course: any): Course {
  const segments = (course.segments || []).map((s: any, i: number) => {
    const text: string = s.text || "";
    const cards = buildCardsFromSegmentText(text, i);
    return {
      idx: s.idx ?? i,
      title: s.title ?? `Segment ${i + 1}`,
      status: i === 0 ? "in_progress" : "not_started",
      cards,
      startSec: s.startSec,
      endSec: s.endSec,
    } as any;
  });

  return {
    id: course.id,
    sourceUrl: course.sourceUrl,
    title: course.title,
    createdAt: course.createdAt,
    segments,
  } as any;
}

function buildCardsFromSegmentText(text: string, idx: number) {
  const clean = String(text || "").trim();
  const listenCard = {
    id: `s${idx}_listen`,
    type: "listen_read" as const,
    text: clean,
  };

  const quiz = makeClozeQuiz(clean, idx);
  return quiz ? [listenCard, quiz] : [listenCard];
}

function pickTargetWord(text: string): string | null {
  const words = text
    .replace(/[^A-Za-z\s']/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 5 && w.length <= 10);
  if (words.length < 3) return null;
  return words[Math.min(words.length - 1, 2)];
}

function makeClozeQuiz(text: string, idx: number) {
  const target = pickTargetWord(text);
  if (!target) return null;

  const blanked = text.replace(new RegExp(`\\b${escapeRegExp(target)}\\b`), "____");

  const distractors = buildDistractors(target);
  const choices = shuffle([
    { id: "a", text: target, isCorrect: true },
    { id: "b", text: distractors[0], isCorrect: false },
    { id: "c", text: distractors[1], isCorrect: false },
    { id: "d", text: distractors[2], isCorrect: false },
  ]);

  return {
    id: `s${idx}_mcq`,
    type: "mcq" as const,
    question: `Fill in the blank: ${blanked}`,
    choices,
    explanation: `Correct word: “${target}”.`,
  };
}

function buildDistractors(word: string): string[] {
  const w = word.toLowerCase();
  const base = w.slice(0, Math.max(3, w.length - 2));
  return [
    base + "ing",
    base + "ed",
    base + "ly",
  ];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}
