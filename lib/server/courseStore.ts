import fs from "node:fs/promises";
import path from "node:path";
import { COURSES_DIR, courseDir } from "./paths";

export type StoredCourse = {
  id: string;
  sourceUrl: string;
  title: string;
  createdAt: number;
  durationSec?: number;
  segments: {
    idx: number;
    title: string;
    startSec: number;
    endSec: number;
    text: string;
  }[];
};

export async function ensureCoursesDir() {
  await fs.mkdir(COURSES_DIR, { recursive: true });
}

export async function readCourse(courseId: string): Promise<StoredCourse | null> {
  try {
    const raw = await fs.readFile(path.join(courseDir(courseId), "manifest.json"), "utf8");
    return JSON.parse(raw) as StoredCourse;
  } catch {
    return null;
  }
}
