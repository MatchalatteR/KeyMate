import * as os from "os";
import * as path from "path";
import { promises as fs } from "fs";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export function isRemoteWindow(remoteName: string | undefined): boolean {
  return Boolean(remoteName);
}

export function parseSshRemoteAlias(remoteName: string | undefined): string | undefined {
  if (!remoteName) {
    return undefined;
  }

  const prefix = "ssh-remote+";
  if (remoteName.startsWith(prefix)) {
    return decodeURIComponent(remoteName.slice(prefix.length));
  }

  const match = remoteName.match(/ssh-remote\+([^/]+)/);
  if (!match || !match[1]) {
    return undefined;
  }
  return decodeURIComponent(match[1]);
}

export async function readLocalPubKeys(): Promise<string[]> {
  const sshDir = path.join(os.homedir(), ".ssh");
  let entries: string[] = [];
  try {
    entries = await fs.readdir(sshDir);
  } catch {
    return [];
  }

  const pubFiles = entries.filter((name) => name.endsWith(".pub"));
  const results: string[] = [];

  for (const file of pubFiles) {
    try {
      const content = await fs.readFile(path.join(sshDir, file), "utf8");
      const lines = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      results.push(...lines);
    } catch {
      // Skip unreadable key files and continue with others.
    }
  }
  return Array.from(new Set(results));
}

export function buildRemoteScript(keys: string[]): string {
  const payload = keys.join("\n").replace(/\n*$/, "\n");
  return `set -euo pipefail
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
while IFS= read -r key; do
  [ -z "$key" ] && continue
  if ! grep -qxF "$key" ~/.ssh/authorized_keys; then
    printf "\n$key" >> ~/.ssh/authorized_keys
  fi
done <<'KEYMATE_KEYS_EOF'
${payload}
KEYMATE_KEYS_EOF`;
}

export async function copyPubKeysToRemote(alias: string, keys: string[]): Promise<void> {
  const script = buildRemoteScript(keys);
  await execFileAsync("ssh", [alias, "bash", "-lc", script], { maxBuffer: 1024 * 1024 });
}
