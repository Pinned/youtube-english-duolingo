"use client";

import type { Course, CourseId } from "./types";
import { makeMockCourse } from "./mockData";

const LS_KEY = "yeduo_mvp_courses_v1";

type Db = {
  courses: Record<CourseId, Course>;
  order: CourseId[];
};

const memory: { db: Db | null } = { db: null };

function safeLoad(): Db {
  if (typeof window === "undefined") return { courses: {}, order: [] };

  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return { courses: {}, order: [] };
    const parsed = JSON.parse(raw) as Db;
    if (!parsed?.courses || !parsed?.order) return { courses: {}, order: [] };
    return parsed;
  } catch {
    return { courses: {}, order: [] };
  }
}

function save(db: Db) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(db));
}

export function getDb(): Db {
  if (!memory.db) memory.db = safeLoad();
  return memory.db;
}

export function listCourses(): Course[] {
  const db = getDb();
  return db.order.map((id) => db.courses[id]).filter(Boolean);
}

export function getCourse(id: CourseId): Course | null {
  const db = getDb();
  return db.courses[id] ?? null;
}

export function createCourseFromUrl(url: string): Course {
  const db = getDb();
  const course = makeMockCourse(url);
  db.courses[course.id] = course;
  db.order = [course.id, ...db.order.filter((x) => x !== course.id)];
  save(db);
  return course;
}

export function setSegmentStatus(courseId: CourseId, idx: number, status: Course["segments"][number]["status"]) {
  const db = getDb();
  const course = db.courses[courseId];
  if (!course) return;
  const seg = course.segments[idx];
  if (!seg) return;
  seg.status = status;
  save(db);
}

export function markSegmentDone(courseId: CourseId, idx: number) {
  const db = getDb();
  const course = db.courses[courseId];
  if (!course) return;
  const seg = course.segments[idx];
  if (!seg) return;
  seg.status = "done";
  const next = course.segments[idx + 1];
  if (next && next.status === "not_started") next.status = "in_progress";
  save(db);
}

export function findContinueSegment(courseId: CourseId): number {
  const course = getCourse(courseId);
  if (!course) return 0;
  const inProg = course.segments.find((s) => s.status === "in_progress");
  if (inProg) return inProg.idx;
  const firstNotDone = course.segments.find((s) => s.status !== "done");
  return firstNotDone?.idx ?? 0;
}
