import { homedir } from "os";
import { dirname, join, resolve } from "path";
import { readdir, mkdir, stat } from "fs/promises";

export const HOME = homedir();

export async function copyFile(src: string, dest: string): Promise<void> {
  await mkdir(dirname(dest), { recursive: true });
  await Bun.write(dest, Bun.file(src));
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

export async function filesMatch(
  pathA: string,
  pathB: string,
): Promise<boolean> {
  const fileA = Bun.file(pathA);
  const fileB = Bun.file(pathB);

  if (!(await fileA.exists()) || !(await fileB.exists())) return false;
  if (fileA.size !== fileB.size) return false;

  const [bytesA, bytesB] = await Promise.all([
    fileA.arrayBuffer(),
    fileB.arrayBuffer(),
  ]);

  return Buffer.from(bytesA).equals(Buffer.from(bytesB));
}

export async function walkDir(dir: string): Promise<string[]> {
  const normalized = resolve(dir);
  const entries = await readdir(normalized, { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath, e.name).slice(normalized.length + 1));
}

export async function showDiff(pathA: string, pathB: string): Promise<void> {
  const proc = Bun.spawn(["diff", "-u", pathA, pathB], {
    stdout: "pipe",
    stderr: "inherit",
  });
  const colordiffProc = Bun.spawn(["colordiff"], {
    stdin: proc.stdout,
    stdout: "inherit",
    stderr: "inherit",
  });
  await Promise.all([proc.exited, colordiffProc.exited]);
}
