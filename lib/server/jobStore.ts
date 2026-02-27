import fs from "node:fs/promises";
import { JOBS_DIR, jobPath } from "./paths";

export type JobStatus = "queued" | "running" | "ready" | "error";

export type ImportJob = {
  jobId: string;
  courseId: string;
  createdAt: number;
  updatedAt: number;
  status: JobStatus;
  progress: number; // 0..1
  step?: string;
  error?: string;
};

export async function ensureJobsDir() {
  await fs.mkdir(JOBS_DIR, { recursive: true });
}

export async function readJob(jobId: string): Promise<ImportJob | null> {
  try {
    const raw = await fs.readFile(jobPath(jobId), "utf8");
    return JSON.parse(raw) as ImportJob;
  } catch {
    return null;
  }
}

export async function writeJob(job: ImportJob) {
  await ensureJobsDir();
  job.updatedAt = Date.now();
  await fs.writeFile(jobPath(job.jobId), JSON.stringify(job, null, 2), "utf8");
}
