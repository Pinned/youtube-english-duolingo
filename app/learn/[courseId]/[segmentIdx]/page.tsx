"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, TopNav, CardShell, Pill, PrimaryButton, SecondaryLink } from "@/components/ui";
import { getStoredCourse, upsertCourse } from "@/lib/client/courseClientStore";
import { apiCourse } from "@/lib/client/api";
import { mapStoredCourseToClient } from "@/lib/client/courseMapper";
import { markSegmentDone, setSegmentStatus } from "@/lib/store";
import type { Card, McqCard } from "@/lib/types";
import { VocabText } from "@/components/VocabPopover";

type Feedback = null | { kind: "correct" | "wrong"; message: string };

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-zinc-100">
      <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function LearnPage() {
  const params = useParams<{ courseId: string; segmentIdx: string }>();
  const router = useRouter();
  const courseId = params.courseId;
  const segmentIdx = Number(params.segmentIdx);

  const course = useMemo(() => getStoredCourse(courseId), [courseId]);
  const seg = useMemo(() => course?.segments[segmentIdx] ?? null, [course, segmentIdx]);

  const [cardIdx, setCardIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  // reset local UI state when route params change
  useEffect(() => {
    setCardIdx(0);
    setSelected(null);
    setFeedback(null);
    if (course) setSegmentStatus(course.id, segmentIdx, "in_progress");
  }, [courseId, segmentIdx, course]);

  // best-effort hydrate from server too
  useEffect(() => {
    apiCourse(courseId)
      .then((stored) => {
        const mapped = mapStoredCourseToClient(stored);
        upsertCourse(mapped);
      })
      .catch(() => undefined);
  }, [courseId]);

  if (!course || !seg) {
    return (
      <Container>
        <TopNav />
        <CardShell>
          <div className="text-sm text-zinc-700">Segment not found.</div>
          <div className="mt-3">
            <SecondaryLink href={`/courses/${courseId}`}>Back</SecondaryLink>
          </div>
        </CardShell>
      </Container>
    );
  }

  const cards = seg.cards;
  const card = cards[cardIdx] as Card;
  const pct = Math.round((cardIdx / cards.length) * 100);

  const onContinue = () => {
    if (cardIdx < cards.length - 1) {
      setCardIdx((x) => x + 1);
      setSelected(null);
      setFeedback(null);
      return;
    }

    // segment finished
    markSegmentDone(course.id, seg.idx);
    const nextIdx = seg.idx + 1;
    const hasNext = nextIdx < course.segments.length;
    if (hasNext) {
      router.push(`/learn/${course.id}/${nextIdx}`);
    } else {
      router.push(`/courses/${course.id}`);
    }
  };

  return (
    <Container>
      <TopNav />

      <div className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-zinc-500">Learning</div>
            <div className="text-lg font-semibold">
              Segment {seg.idx + 1} <span className="text-zinc-500 font-normal">•</span> {seg.title}
            </div>
          </div>
          <Pill tone="zinc">
            {cardIdx + 1}/{cards.length}
          </Pill>
        </div>
        <div className="mt-3">
          <ProgressBar pct={pct} />
        </div>
      </div>

      {card.type === "listen_read" && (
        <div className="mb-4">
          <YouTubeSegmentPlayer courseUrl={course.sourceUrl} startSec={seg.startSec ?? 0} />
        </div>
      )}

      <LearnCard
        card={card}
        selected={selected}
        onSelect={(choiceId) => {
          setSelected(choiceId);
        }}
      />

      <div className="mt-6 flex items-center justify-between">
        <SecondaryLink href={`/courses/${course.id}`}>← Exit</SecondaryLink>
        <div className="text-xs text-zinc-500">Tap highlighted words to open mock vocab.</div>
      </div>

      <BottomBar
        mode={card.type === "mcq" ? "quiz" : "info"}
        selected={selected}
        feedback={feedback}
        onPrimary={() => {
          if (card.type === "mcq") {
            if (!selected) return;
            if (!feedback) {
              const c = card as McqCard;
              const ch = c.choices.find((x) => x.id === selected);
              if (!ch) return;
              setFeedback({
                kind: ch.isCorrect ? "correct" : "wrong",
                message: ch.isCorrect ? "Correct!" : "Not quite — try again or continue.",
              });
              return;
            }
          }
          onContinue();
        }}
        explanation={card.type === "mcq" ? (card as McqCard).explanation : undefined}
        renderInfo={() => {
          if (card.type !== "listen_read") return null;
          return (
            <div className="text-sm text-zinc-700 leading-7">
              <VocabText text={card.text} />
            </div>
          );
        }}
      />
    </Container>
  );
}

function LearnCard({
  card,
  selected,
  onSelect,
}: {
  card: Card;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  if (card.type === "listen_read") {
    return (
      <CardShell className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Listen & Read</div>
          <span className="text-xs text-zinc-500">(YouTube)</span>
        </div>
        <div className="mt-4 text-xl leading-9">
          <VocabText text={card.text} />
        </div>
        <div className="mt-4 text-sm text-zinc-600">
          Tip: read it out loud once. Then tap Continue.
        </div>
      </CardShell>
    );
  }

  const c = card as McqCard;
  return (
    <CardShell className="p-6">
      <div className="text-sm font-semibold">Quick quiz</div>
      <div className="mt-3 text-lg font-semibold leading-8">{c.question}</div>
      <div className="mt-4 grid gap-2">
        {c.choices.map((ch) => {
          const active = selected === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                onSelect(ch.id);
              }}
              className={
                "w-full rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors " +
                (active ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:bg-zinc-50")
              }
            >
              {ch.text}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-zinc-500">Choose one option, then hit Check.</div>

      {/* hidden: onCheck is triggered by bottom bar */}
    </CardShell>
  );
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.replace("/", "") || null;
    if (u.hostname.includes("youtube.com")) {
      return u.searchParams.get("v") || null;
    }
    return null;
  } catch {
    return null;
  }
}

function YouTubeSegmentPlayer({ courseUrl, startSec }: { courseUrl: string; startSec: number }) {
  const vid = extractYouTubeId(courseUrl);
  if (!vid) return null;

  const src = `https://www.youtube.com/embed/${vid}?start=${Math.max(0, Math.floor(startSec))}&autoplay=0&modestbranding=1&rel=0`;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-black">
      <iframe
        title="YouTube"
        src={src}
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function BottomBar({
  mode,
  selected,
  feedback,
  onPrimary,
  explanation,
  renderInfo,
}: {
  mode: "quiz" | "info";
  selected: string | null;
  feedback: Feedback;
  onPrimary: () => void;
  explanation?: string;
  renderInfo: () => React.ReactNode;
}) {
  const bg = feedback?.kind === "correct" ? "bg-emerald-50 border-emerald-200" : feedback?.kind === "wrong" ? "bg-rose-50 border-rose-200" : "bg-white border-zinc-200";
  const text = feedback?.kind === "correct" ? "text-emerald-800" : feedback?.kind === "wrong" ? "text-rose-800" : "text-zinc-800";

  const primaryLabel = mode === "quiz" ? (feedback ? "Continue" : "Check") : "Continue";
  const disabled = mode === "quiz" && !feedback && !selected;

  return (
    <div className={"fixed bottom-0 left-0 right-0 z-40 border-t " + bg}>
      <div className="mx-auto w-full max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className={"min-h-[44px] flex-1 text-sm font-semibold " + text}>
            {feedback ? (
              <div>
                <div>{feedback.message}</div>
                {explanation && feedback.kind === "correct" && <div className="mt-1 text-xs font-medium text-zinc-600">{explanation}</div>}
                {explanation && feedback.kind === "wrong" && <div className="mt-1 text-xs font-medium text-zinc-600">{explanation}</div>}
              </div>
            ) : (
              <div className="text-xs text-zinc-500">{mode === "quiz" ? "Select an answer." : renderInfo()}</div>
            )}
          </div>
          <PrimaryButton onClick={onPrimary} disabled={disabled}>
            {primaryLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
