import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const wavPlayer = require('node-wav-player');

function getRandomSound(folder: string): string | null {
  if (!fs.existsSync(folder)) return null;
  const files = fs.readdirSync(folder).filter((f: string) =>
    path.extname(f).toLowerCase() === '.wav'
  );
  if (files.length === 0) return null;
  return path.join(folder, files[Math.floor(Math.random() * files.length)]);
}

function playSound(type: 'success' | 'error', extensionPath: string) {
  const folder = path.join(extensionPath, 'sounds', type);
  const file = getRandomSound(folder);
  if (!file) return;
  wavPlayer.play({ path: file }).catch((err: Error) =>
    console.error(`[SoundFX] Playback failed: ${err.message}`)
  );
}

const cellDebounceMap = new Map<string, ReturnType<typeof setTimeout>>();

function getCellKey(cell: vscode.NotebookCell): string {
  return `${cell.notebook.uri.toString()}::${cell.index}`;
}

function handleNotebookChange(
  event: vscode.NotebookDocumentChangeEvent,
  extensionPath: string
) {
  for (const cellChange of event.cellChanges) {
    if (!cellChange.outputs) continue;
    if (cellChange.cell.kind !== vscode.NotebookCellKind.Code) continue;
    const cell = cellChange.cell;
    const outputs = cell.outputs;
    if (outputs.length === 0) continue;
    const key = getCellKey(cell);
    const existing = cellDebounceMap.get(key);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      cellDebounceMap.delete(key);
      const hasError = outputs.some(output =>
        output.items.some(item => item.mime === 'application/vnd.code.notebook.error')
      );
      playSound(hasError ? 'error' : 'success', extensionPath);
    }, 300);
    cellDebounceMap.set(key, timer);
  }
}

let enabled = true;

export function activate(context: vscode.ExtensionContext) {
  const extPath = context.extensionPath;

  const toggleCmd = vscode.commands.registerCommand('terminalSoundFx.toggle', () => {
    enabled = !enabled;
    vscode.window.showInformationMessage(
      `Terminal Sound FX is now ${enabled ? '🔊 ON' : '🔇 OFF'}`
    );
  });

  const terminalListener = vscode.window.onDidEndTerminalShellExecution(event => {
    if (!enabled) return;
    const code = event.exitCode;
    if (code === undefined) return;
    playSound(code === 0 ? 'success' : 'error', extPath);
  });

  const notebookListener = vscode.workspace.onDidChangeNotebookDocument(event => {
    if (!enabled) return;
    handleNotebookChange(event, extPath);
  });

  context.subscriptions.push(toggleCmd, terminalListener, notebookListener);
}

export function deactivate() {
  for (const timer of cellDebounceMap.values()) clearTimeout(timer);
  cellDebounceMap.clear();
}