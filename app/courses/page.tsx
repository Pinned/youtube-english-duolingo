"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Container, TopNav, CardShell, Pill, SecondaryLink } from "@/components/ui";
import { listStoredCourses } from "@/lib/client/courseClientStore";

export default function CoursesPage() {
  const courses = useMemo(() => listStoredCourses(), []);

  return (
    <Container>
      <TopNav />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My courses</h1>
          <p className="mt-1 text-sm text-zinc-600">Stored locally in your browser (localStorage).</p>
        </div>
        <SecondaryLink href="/import">+ Import</SecondaryLink>
      </div>

      {courses.length === 0 ? (
        <CardShell className="mt-6">
          <div className="text-sm text-zinc-700">No courses yet.</div>
          <div className="mt-3">
            <Link
              href="/import"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
            >
              Import a link
            </Link>
          </div>
        </CardShell>
      ) : (
        <div className="mt-6 grid gap-4">
          {courses.map((c) => {
            const done = c.segments.filter((s) => s.status === "done").length;
            const pct = Math.round((done / c.segments.length) * 100);
            return (
              <Link key={c.id} href={`/courses/${c.id}`} className="block">
                <CardShell className="hover:border-zinc-300">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold">{c.title}</div>
                      <div className="mt-1 text-xs text-zinc-500 break-all">{c.sourceUrl}</div>
                    </div>
                    <Pill tone={pct === 100 ? "green" : "blue"}>{pct}%</Pill>
                  </div>
                  <div className="mt-4 h-2 w-full rounded-full bg-zinc-100">
                    <div className="h-2 rounded-full bg-zinc-900" style={{ width: `${pct}%` }} />
                  </div>
                </CardShell>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
