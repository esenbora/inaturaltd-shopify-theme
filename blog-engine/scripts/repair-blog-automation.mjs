import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const enabled = process.env.BLOG_AUTOMATION_REPAIR !== "0";
const packageDir = join(process.cwd(), "node_modules", "blog-automation");
const distEntry = join(packageDir, "dist", "index.js");
const sourceRef = "cbbe8955f048a324015de3f3e221912bad7f2019";

if (!enabled || existsSync(distEntry) || !existsSync(packageDir)) {
  process.exit(0);
}

const workspace = mkdtempSync(join(tmpdir(), "blog-automation-build-"));
const sourceDir = join(workspace, "source");

try {
  execFileSync(
    "git",
    [
      "clone",
      "--depth",
      "1",
      "--branch",
      sourceRef,
      "https://github.com/pandnyr/blog-automation.git",
      sourceDir,
    ],
    { stdio: "ignore" }
  );
} catch {
  execFileSync(
    "git",
    ["clone", "https://github.com/pandnyr/blog-automation.git", sourceDir],
    { stdio: "ignore" }
  );
  execFileSync("git", ["checkout", sourceRef], { cwd: sourceDir, stdio: "ignore" });
}

execFileSync("npm", ["ci", "--ignore-scripts"], { cwd: sourceDir, stdio: "inherit" });
execFileSync("npm", ["run", "build"], { cwd: sourceDir, stdio: "inherit" });
cpSync(join(sourceDir, "dist"), join(packageDir, "dist"), { recursive: true });
rmSync(workspace, { recursive: true, force: true });
