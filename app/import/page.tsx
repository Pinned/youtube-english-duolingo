"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, TopNav, CardShell, PrimaryButton, SecondaryLink } from "@/components/ui";
import { createCourseFromUrl } from "@/lib/store";

function isValidYouTubeOrHttpUrl(u: string) {
  try {
    const url = new URL(u);
    if (!/^https?:$/.test(url.protocol)) return false;
    // allow any http(s) for now, but validate youtube-like a bit to feel real
    const h = url.hostname.toLowerCase();
    const isYoutube = h.includes("youtube.com") || h === "youtu.be";
    return isYoutube || h.length > 0;
  } catch {
    return false;
  }
}

export default function ImportPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = useMemo(() => isValidYouTubeOrHttpUrl(url.trim()), [url]);

  return (
    <Container>
      <TopNav />

      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Import a YouTube link</h1>
          <p className="mt-1 text-sm text-zinc-600">
            MVP uses mock data. We only validate the URL on the frontend and generate a local course.
          </p>
        </div>

        <CardShell>
          <label className="text-sm font-semibold">Video URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          {touched && !valid && url.trim().length > 0 && (
            <div className="mt-2 text-sm text-rose-600">Please enter a valid http(s) URL.</div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <PrimaryButton
              disabled={!valid}
              onClick={() => {
                const course = createCourseFromUrl(url.trim());
                router.push(`/courses/${course.id}`);
              }}
            >
              Create course
            </PrimaryButton>

            <SecondaryLink href="/courses">View my courses</SecondaryLink>
          </div>
        </CardShell>

        <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold">Demo tips</div>
          <ul className="list-disc pl-5 text-sm text-zinc-700">
            <li>Import any URL (YouTube recommended). A local mock course is created.</li>
            <li>Open the course and hit “Continue learning”.</li>
            <li>On learning page: tap highlighted words for mock definitions.</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
