import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "node:fs/promises";
import { ensureCoursesDir } from "@/lib/server/courseStore";
import { writeJob } from "@/lib/server/jobStore";
import { spawnImportWorker } from "@/lib/server/spawnImport";
import { makeCourseId, makeJobId } from "@/lib/tasks/importCourse";
import { courseDir } from "@/lib/server/paths";

const BodySchema = z.object({ url: z.string().url() });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body. Expect {url}." }, { status: 400 });
  }

  const url = parsed.data.url;
  const courseId = makeCourseId(url);
  const jobId = makeJobId();

  await ensureCoursesDir();
  await fs.mkdir(courseDir(courseId), { recursive: true });

  await writeJob({
    jobId,
    courseId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "queued",
    progress: 0,
    step: "queued",
  });

  spawnImportWorker({ url, jobId, courseId });

  return NextResponse.json({ jobId, courseId });
}
