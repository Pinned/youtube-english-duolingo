import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { writeJob, type ImportJob } from "@/lib/server/jobStore";
import { courseDir } from "@/lib/server/paths";

export function makeCourseId(url: string) {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 12);
}

export function makeJobId() {
  return crypto.randomBytes(8).toString("hex");
}

// This is the async task executed by a separate Node process.
export async function runImportTask(params: { url: string; jobId: string; courseId: string }) {
  const { url, jobId, courseId } = params;

  const update = async (patch: Partial<ImportJob>) => {
    const base: ImportJob = {
      jobId,
      courseId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "running",
      progress: 0,
    };
    // best-effort merge with existing
    let current: ImportJob | null = null;
    try {
      const raw = await fs.readFile(path.resolve(process.cwd(), "data", "jobs", `${jobId}.json`), "utf8");
      current = JSON.parse(raw) as ImportJob;
    } catch {
      // ignore
    }
    await writeJob({ ...(current ?? base), ...patch, jobId, courseId });
  };

  try {
    await update({ status: "running", progress: 0.02, step: "preparing" });

    const outDir = courseDir(courseId);
    await fs.mkdir(outDir, { recursive: true });

    // Use ytbnotes CLI via child_process (keeps Next bundler happy).
    // It will check yt-dlp and OPENAI_API_KEY.
    await update({ progress: 0.05, step: "downloading/transcribing" });

    const { execFile } = await import("node:child_process");
    // Locate ytbnotes CLI (repo name: youtube-bilingual-notes)
    const ytbnotesBin =
      process.env.YEDUO_YTBNOTES_BIN ||
      path.resolve(process.cwd(), "..", "youtube-bilingual-notes", "bin", "ytbnotes.js");

    await new Promise<void>((resolve, reject) => {
      execFile(
        process.execPath,
        [
          ytbnotesBin,
          url,
          "--outDir",
          outDir,
          "--chunkMinutes",
          String(Number(process.env.YEDUO_CHUNK_MINUTES || 5)),
          "--model",
          process.env.YEDUO_LLM_MODEL || "gpt-4.1-mini",
          "--sttModel",
          process.env.YEDUO_STT_MODEL || "whisper-1",
          "--retries",
          "1",
        ],
        { env: { ...process.env } },
        (err, _stdout, _stderr) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    await update({ progress: 0.75, step: "building segments" });

    // read transcript jsonl and create segments.json + manifest.json
    const jsonlPath = path.join(outDir, "01_transcript.jsonl");
    const jsonl = await fs.readFile(jsonlPath, "utf8");
    const lines: { start: number; end: number; text: string }[] = jsonl
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));

    const segments: {
      idx: number;
      title: string;
      startSec: number;
      endSec: number;
      text: string;
    }[] = [];

    const segSize = Number(process.env.YEDUO_SEGMENT_SECONDS || 30);
    let curStart = 0;
    let curEnd = 0;
    let buf: string[] = [];
    let idx = 0;

    for (const ln of lines) {
      if (buf.length === 0) curStart = ln.start;
      curEnd = ln.end;
      buf.push(ln.text);

      const dur = curEnd - curStart;
      if (dur >= segSize) {
        const text = buf.join(" ").replace(/\s+/g, " ").trim();
        segments.push({
          idx,
          title: `Segment ${idx + 1}`,
          startSec: Math.max(0, Math.floor(curStart)),
          endSec: Math.max(0, Math.ceil(curEnd)),
          text,
        });
        idx++;
        buf = [];
      }
    }
    if (buf.length) {
      const text = buf.join(" ").replace(/\s+/g, " ").trim();
      segments.push({
        idx,
        title: `Segment ${idx + 1}`,
        startSec: Math.max(0, Math.floor(curStart)),
        endSec: Math.max(0, Math.ceil(curEnd)),
        text,
      });
    }

    await fs.writeFile(path.join(outDir, "segments.json"), JSON.stringify({ segments }, null, 2), "utf8");

    const manifest = {
      id: courseId,
      sourceUrl: url,
      title: `YouTube Course (${courseId})`,
      createdAt: Date.now(),
      segments,
    };

    await fs.writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

    await update({ status: "ready", progress: 1, step: "done" });
  } catch (e: any) {
    await writeJob({
      jobId,
      courseId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "error",
      progress: 1,
      error: e?.stack || e?.message || String(e),
    });
  }
}
