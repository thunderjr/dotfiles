import { platform } from "os";

export type Platform = "macos" | "linux";

export function detectPlatform(): Platform {
  const p = platform();
  if (p === "darwin") return "macos";
  if (p === "linux") return "linux";
  throw new Error(`Unsupported platform: ${p}`);
}
