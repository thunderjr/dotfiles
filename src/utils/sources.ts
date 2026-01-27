import { join } from "path";

export async function parseSources(projectRoot: string): Promise<string[]> {
  const sourcesPath = join(projectRoot, "sources.txt");
  const file = Bun.file(sourcesPath);

  if (!(await file.exists())) {
    throw new Error(`sources.txt not found at ${sourcesPath}`);
  }

  const text = await file.text();
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}
