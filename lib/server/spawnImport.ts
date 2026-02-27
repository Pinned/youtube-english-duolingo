import path from "node:path";
import { spawn } from "node:child_process";

export function spawnImportWorker(payload: { url: string; jobId: string; courseId: string }) {
  const workerPath = path.resolve(process.cwd(), "lib", "tasks", "worker.ts");

  const child = spawn(process.execPath, ["--import", "tsx", "--", workerPath, JSON.stringify(payload)], {
    stdio: "ignore",
    detached: true,
    env: {
      ...process.env,
    },
  });

  child.unref();
}
