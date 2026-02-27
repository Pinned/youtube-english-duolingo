import path from "node:path";

export const DATA_DIR = path.resolve(process.cwd(), "data");
export const JOBS_DIR = path.join(DATA_DIR, "jobs");
export const COURSES_DIR = path.join(DATA_DIR, "courses");

export function courseDir(courseId: string) {
  return path.join(COURSES_DIR, courseId);
}

export function jobPath(jobId: string) {
  return path.join(JOBS_DIR, `${jobId}.json`);
}
