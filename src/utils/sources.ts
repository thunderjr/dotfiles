import { join } from "path";
import type { Platform } from "./platform";

export async function parseSources(
  projectRoot: string,
  platform: Platform,
): Promise<string[]> {
  const filename = `sources.${platform}.txt`;
  const sourcesPath = join(projectRoot, filename);
  const file = Bun.file(sourcesPath);

  if (!(await file.exists())) {
    throw new Error(`${filename} not found at ${sourcesPath}`);
  }

  const text = await file.text();
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}
