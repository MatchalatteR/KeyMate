import * as vscode from "vscode";

export type Lang = "zh" | "en";

type MsgKey =
  | "window.local"
  | "window.remote"
  | "window.unsupportedRemote"
  | "window.fallbackCurrentRemote"
  | "error.noPubKeys"
  | "error.remoteNameMissing"
  | "error.copyFailed"
  | "success.copyDone"
  | "action.start";

const messages: Record<Lang, Record<MsgKey, string>> = {
  zh: {
    "window.local": "当前是本地窗口，无需配置远端免密登录。",
    "window.remote": "检测到远程窗口，开始配置 SSH 免密登录...",
    "window.unsupportedRemote": "无法自动识别 SSH 主机别名。",
    "window.fallbackCurrentRemote": "将改用当前远程会话直接写入 authorized_keys（无需输入）。",
    "error.noPubKeys": "未在本机 ~/.ssh 中找到任何 .pub 公钥文件。",
    "error.remoteNameMissing": "无法识别远端 SSH 主机名。",
    "error.copyFailed": "复制公钥到远端失败：{0}",
    "success.copyDone": "已完成：本机公钥已写入远端 ~/.ssh/authorized_keys。",
    "action.start": "开始配置"
  },
  en: {
    "window.local": "This is a local window. No remote SSH setup is needed.",
    "window.remote": "Remote window detected. Setting up passwordless SSH...",
    "window.unsupportedRemote": "Unable to auto-detect SSH host alias.",
    "window.fallbackCurrentRemote": "Fallback: write authorized_keys through the current remote session (no input needed).",
    "error.noPubKeys": "No public keys (*.pub) were found in local ~/.ssh.",
    "error.remoteNameMissing": "Unable to resolve the remote SSH host name.",
    "error.copyFailed": "Failed to copy keys to remote host: {0}",
    "success.copyDone": "Done. Local public keys were added to remote ~/.ssh/authorized_keys.",
    "action.start": "Start setup"
  }
};

export function resolveLang(): Lang {
  const config = vscode.workspace.getConfiguration("keymate");
  const setting = config.get<string>("language", "auto");
  if (setting === "zh" || setting === "en") {
    return setting;
  }
  return vscode.env.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function t(key: MsgKey, ...args: string[]): string {
  const lang = resolveLang();
  let text = messages[lang][key];
  args.forEach((arg, idx) => {
    text = text.replace(`{${idx}}`, arg);
  });
  return text;
}
