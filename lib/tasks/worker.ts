#!/usr/bin/env node
import { runImportTask } from "./importCourse";

async function main() {
  const raw = process.argv[2];
  if (!raw) throw new Error("Missing arg: JSON payload");
  const payload = JSON.parse(raw) as { url: string; jobId: string; courseId: string };
  await runImportTask(payload);
}

main().catch((e) => {
  console.error(e?.stack || e);
  process.exit(1);
});
