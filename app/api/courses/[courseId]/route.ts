import { NextResponse } from "next/server";
import { readCourse } from "@/lib/server/courseStore";

export async function GET(_req: Request, ctx: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await ctx.params;
  const course = await readCourse(courseId);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json({ course });
}
