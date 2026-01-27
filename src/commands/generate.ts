import { join } from "path";
import { parseSources } from "../utils/sources";
import { HOME, copyFile, isDirectory, walkDir } from "../utils/files";
import type { Platform } from "../utils/platform";

export async function generate(projectRoot: string, platform: Platform) {
  const sources = await parseSources(projectRoot);
  const platformDir = join(projectRoot, platform);

  let copied = 0;
  let skipped = 0;

  for (const relPath of sources) {
    const src = join(HOME, relPath);

    if (await isDirectory(src)) {
      const files = await walkDir(src);
      for (const file of files) {
        const fileSrc = join(src, file);
        const fileDest = join(platformDir, relPath, file);
        await copyFile(fileSrc, fileDest);
        console.log(`COPY  ${join(relPath, file)}`);
        copied++;
      }
      continue;
    }

    const srcFile = Bun.file(src);
    if (!(await srcFile.exists())) {
      console.log(`SKIP  ${relPath} (not found)`);
      skipped++;
      continue;
    }

    await copyFile(src, join(platformDir, relPath));
    console.log(`COPY  ${relPath}`);
    copied++;
  }

  console.log(`\nDone: ${copied} copied, ${skipped} skipped`);
}
