import { resolve, join } from "path";
import { detectPlatform } from "./utils/platform";
import { generate } from "./commands/generate";
import { sync } from "./commands/sync";

const USAGE = `Usage: bun run <command>

Commands:
  generate  Copy files listed in sources.txt from $HOME into the platform directory
  sync      Sync stored dotfiles back to $HOME`;

async function main() {
  const command = process.argv[2];
  const projectRoot = resolve(join(import.meta.dir, ".."));
  const platform = detectPlatform();

  switch (command) {
    case "generate":
      await generate(projectRoot, platform);
      break;
    case "sync":
      await sync(projectRoot, platform);
      break;
    default:
      console.log(USAGE);
      process.exit(command ? 1 : 0);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
