"use client";

import type { Course, CourseId } from "@/lib/types";

const LS_KEY = "yeduo_courses_runtime_v1";

type Db = {
  courses: Record<CourseId, Course>;
  order: CourseId[];
};

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

export function upsertCourse(course: Course) {
  const db = safeLoad();
  db.courses[course.id] = course;
  db.order = [course.id, ...db.order.filter((x) => x !== course.id)];
  save(db);
}

export function getStoredCourse(id: CourseId): Course | null {
  const db = safeLoad();
  return db.courses[id] ?? null;
}

export function listStoredCourses(): Course[] {
  const db = safeLoad();
  return db.order.map((id) => db.courses[id]).filter(Boolean);
}
