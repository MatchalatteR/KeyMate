import * as vscode from "vscode";
import { t } from "./i18n";
import {
  buildRemoteScript,
  isRemoteWindow,
  readLocalPubKeys
} from "./ssh";

function shellQuote(input: string): string {
  return `'${input.replace(/'/g, `'\"'\"'`)}'`;
}

async function copyPubKeysByCurrentRemoteSession(keys: string[]): Promise<void> {
  const script = buildRemoteScript(keys);
  const task = new vscode.Task(
    { type: "shell" },
    vscode.TaskScope.Workspace,
    "KeyMate Apply SSH Keys",
    "KeyMate",
    new vscode.ShellExecution(`bash -lc ${shellQuote(script)}`)
  );
  task.presentationOptions = {
    echo: false,
    reveal: vscode.TaskRevealKind.Never,
  };

  const execution = await vscode.tasks.executeTask(task);
  await new Promise<void>((resolve, reject) => {
    const disposable = vscode.tasks.onDidEndTaskProcess((event) => {
      if (event.execution !== execution) {
        return;
      }
      disposable.dispose();
      if (event.exitCode === 0 || event.exitCode === undefined) {
        resolve();
      } else {
        reject(new Error(`Remote task exited with code ${event.exitCode}`));
      }
    });
  });
}

async function runSetup(): Promise<void> {
  const remoteName = vscode.env.remoteName;
  if (!isRemoteWindow(remoteName)) {
    vscode.window.showInformationMessage(t("window.local"));
    return;
  }

  vscode.window.showInformationMessage(t("window.remote"));

  const keys = await readLocalPubKeys();
  if (keys.length === 0) {
    vscode.window.showErrorMessage(t("error.noPubKeys"));
    return;
  }

  try {
    await copyPubKeysByCurrentRemoteSession(keys);
    vscode.window.showInformationMessage(t("success.copyDone"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    vscode.window.showErrorMessage(t("error.copyFailed", detail));
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("keymate.setupPasswordlessSsh", async () => {
    await runSetup();
  });

  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
