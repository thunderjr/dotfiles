import { join } from "path";
import { stat } from "fs/promises";
import { HOME, copyFile, filesMatch, walkDir, showDiff } from "../utils/files";
import type { Platform } from "../utils/platform";

async function prompt(question: string): Promise<boolean> {
  process.stdout.write(question);
  for await (const line of console) {
    return line.trim().toLowerCase() === "y";
  }
  return false;
}

async function dirExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

export async function sync(projectRoot: string, platform: Platform) {
  const platformDir = join(projectRoot, platform);

  if (!(await dirExists(platformDir))) {
    console.log(`No ${platform}/ directory found. Run generate first.`);
    return;
  }

  const files = await walkDir(platformDir);
  if (files.length === 0) {
    console.log(`No files found in ${platform}/. Run generate first.`);
    return;
  }

  const upToDate: string[] = [];
  const missing: string[] = [];
  const differs: string[] = [];

  for (const relPath of files) {
    const repoPath = join(platformDir, relPath);
    const homePath = join(HOME, relPath);

    const homeFile = Bun.file(homePath);
    if (!(await homeFile.exists())) {
      missing.push(relPath);
    } else if (await filesMatch(repoPath, homePath)) {
      upToDate.push(relPath);
    } else {
      differs.push(relPath);
    }
  }

  // Summary
  console.log(`\n  Up to date: ${upToDate.length}`);
  console.log(`  Missing:    ${missing.length}`);
  console.log(`  Differs:    ${differs.length}\n`);

  let synced = 0;

  // Copy missing files without prompting
  for (const relPath of missing) {
    const repoPath = join(platformDir, relPath);
    const homePath = join(HOME, relPath);
    await copyFile(repoPath, homePath);
    console.log(`COPY  ${relPath} (missing locally)`);
    synced++;
  }

  // Show diff and prompt for differing files
  for (const relPath of differs) {
    const repoPath = join(platformDir, relPath);
    const homePath = join(HOME, relPath);

    console.log(`\n--- ${relPath} ---`);
    await showDiff(homePath, repoPath);

    const accept = await prompt(`\nOverwrite ~/${relPath}? [y/N] `);
    if (accept) {
      await copyFile(repoPath, homePath);
      console.log(`SYNC  ${relPath}`);
      synced++;
    } else {
      console.log(`SKIP  ${relPath}`);
    }
  }

  console.log(`\nSync complete: ${synced} file(s) synced`);
}
