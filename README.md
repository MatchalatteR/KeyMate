# KeyMate

Extension for one-click passwordless SSH setup.

## Features

- Detect current window type: local vs remote.
- If current window is SSH remote (`ssh-remote+...`), copy all local `~/.ssh/*.pub` keys to remote `~/.ssh/authorized_keys`.
- Bilingual messages (Chinese/English), configurable via `keymate.language`.

## Command

- `KeyMate: Setup Passwordless SSH`

## Notes

- Auto setup currently supports SSH Remote windows.
- The extension executes local `ssh <alias> ...` to append keys on the remote host.
- Existing keys are preserved and duplicate key lines are skipped.

## Development

```bash
npm install
npm run compile
npm test
```
## Package

```bash
npm install -g @vscode/vsce
vsce package
```

## LICENSE

MIT
