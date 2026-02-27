"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, TopNav, CardShell, PrimaryButton, SecondaryLink } from "@/components/ui";
import { apiJob } from "@/lib/client/api";

export default function JobPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId;

  const [status, setStatus] = useState<string>("queued");
  const [progress, setProgress] = useState<number>(0);
  const [courseId, setCourseId] = useState<string>("");
  const [step, setStep] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const j = await apiJob(jobId);
        if (!alive) return;
        setStatus(j.status);
        setProgress(j.progress);
        setCourseId(j.courseId);
        setStep(j.step);
        setError(j.error);
        if (j.status === "ready" && j.courseId) {
          router.replace(`/courses/${j.courseId}`);
        }
      } catch (e: any) {
        if (!alive) return;
        setStatus("error");
        setError(e?.message || String(e));
      }
    };

    run();
    const t = setInterval(() => {
      setTick((x) => x + 1);
    }, 1500);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [jobId, router, tick]);

  return (
    <Container>
      <TopNav />
      <div className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Importing…</h1>
          <div className="mt-1 text-sm text-zinc-600 break-all">Job: {jobId}</div>
        </div>

        <CardShell>
          <div className="text-sm font-semibold">Status: {status}</div>
          {step && <div className="mt-1 text-xs text-zinc-500">Step: {step}</div>}
          <div className="mt-3 h-2 w-full rounded-full bg-zinc-100">
            <div className="h-2 rounded-full bg-zinc-900" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="mt-2 text-xs text-zinc-500">{Math.round(progress * 100)}%</div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 whitespace-pre-wrap">
              {error}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            {status === "error" && (
              <PrimaryButton
                onClick={() => {
                  router.replace("/import");
                }}
              >
                Retry
              </PrimaryButton>
            )}
            {courseId && <SecondaryLink href={`/courses/${courseId}`}>Go to course</SecondaryLink>}
            <SecondaryLink href="/courses">All courses</SecondaryLink>
          </div>
        </CardShell>
      </div>
    </Container>
  );
}
