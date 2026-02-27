export type ImportResp = { jobId: string; courseId: string };

export async function apiImport(url: string): Promise<ImportResp> {
  const res = await fetch("/api/import", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Import failed (${res.status})`);
  return json as ImportResp;
}

export async function apiJob(jobId: string): Promise<{ status: string; progress: number; error?: string; courseId: string; step?: string }> {
  const res = await fetch(`/api/jobs/${jobId}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Job fetch failed (${res.status})`);
  return json;
}

export async function apiCourse(courseId: string): Promise<any> {
  const res = await fetch(`/api/courses/${courseId}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Course fetch failed (${res.status})`);
  return json?.course;
}
