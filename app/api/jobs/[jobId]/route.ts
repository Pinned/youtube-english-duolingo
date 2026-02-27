import { NextResponse } from "next/server";
import { readJob } from "@/lib/server/jobStore";

export async function GET(_req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await ctx.params;
  const job = await readJob(jobId);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    error: job.error,
    courseId: job.courseId,
    step: job.step,
  });
}
