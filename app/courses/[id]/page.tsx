"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Container, TopNav, CardShell, Pill, PrimaryButton, SecondaryLink } from "@/components/ui";
import { findContinueSegment, getCourse } from "@/lib/store";
import type { Course } from "@/lib/types";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const courseId = params.id;

  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    setCourse(getCourse(courseId));
  }, [courseId]);

  const continueIdx = useMemo(() => (course ? findContinueSegment(course.id) : 0), [course]);

  if (!course) {
    return (
      <Container>
        <TopNav />
        <CardShell>
          <div className="text-sm text-zinc-700">Course not found.</div>
          <div className="mt-3">
            <SecondaryLink href="/courses">Back</SecondaryLink>
          </div>
        </CardShell>
      </Container>
    );
  }

  const done = course.segments.filter((s) => s.status === "done").length;
  const pct = Math.round((done / course.segments.length) * 100);

  return (
    <Container>
      <TopNav />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-500 break-all">{course.sourceUrl}</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{course.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Pill tone={pct === 100 ? "green" : "blue"}>{pct}% completed</Pill>
            <Pill tone="zinc">{course.segments.length} segments</Pill>
          </div>
        </div>

        <PrimaryButton
          onClick={() => {
            router.push(`/learn/${course.id}/${continueIdx}`);
          }}
        >
          Continue
        </PrimaryButton>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-zinc-100">
        <div className="h-2 rounded-full bg-zinc-900" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-8">
        <div className="mb-3 text-sm font-semibold text-zinc-800">Segments</div>
        <div className="grid gap-3">
          {course.segments.map((s) => {
            const tone = s.status === "done" ? "green" : s.status === "in_progress" ? "blue" : "zinc";
            const label = s.status === "done" ? "Done" : s.status === "in_progress" ? "In progress" : "Not started";

            return (
              <Link key={s.idx} href={`/learn/${course.id}/${s.idx}`} className="block">
                <CardShell className="hover:border-zinc-300">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">
                        {s.idx + 1}. {s.title}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">{s.cards.length} cards</div>
                    </div>
                    <Pill tone={tone as "green" | "blue" | "zinc"}>{label}</Pill>
                  </div>
                </CardShell>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <SecondaryLink href="/courses">← Back to courses</SecondaryLink>
      </div>
    </Container>
  );
}
