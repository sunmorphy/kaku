import { spawn } from "bun";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("Starting monorepo dev servers in order: backend ➔ cms ➔ frontend...\n");

  // 1. Start Backend
  console.log("⚡ [backend] Starting Express API...");
  const backend = Bun.spawn(["bun", "run", "dev"], {
    cwd: "./apps/backend",
    stdout: "inherit",
    stderr: "inherit",
  });

  await delay(2000); // Wait 2s for backend database connection & server initialization

  // 2. Start CMS
  console.log("\n⚡ [cms] Starting Next.js CMS...");
  const cms = Bun.spawn(["bun", "run", "dev"], {
    cwd: "./apps/cms",
    stdout: "inherit",
    stderr: "inherit",
  });

  await delay(1500); // Wait 1.5s for Next dev server to boot

  // 3. Start Frontend
  console.log("\n⚡ [frontend] Starting Next.js frontend...");
  const frontend = Bun.spawn(["bun", "run", "dev"], {
    cwd: "./apps/frontend",
    stdout: "inherit",
    stderr: "inherit",
  });

  // Handle clean exit on Ctrl+C (SIGINT) or SIGTERM
  const cleanup = () => {
    console.log("\n Shutting down all dev servers...");
    try {
      backend.kill();
      cms.kill();
      frontend.kill();
    } catch (e) {
      // Ignore errors if processes are already terminated
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Keep the process alive and wait for all spawned processes
  await Promise.all([backend.exited, cms.exited, frontend.exited]);
}

run();
