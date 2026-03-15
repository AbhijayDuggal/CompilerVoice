"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/node-wav-player/lib/wav-player.js
var require_wav_player = __commonJS({
  "node_modules/node-wav-player/lib/wav-player.js"(exports2, module2) {
    "use strict";
    var mFs = require("fs");
    var mSpawn = require("child_process").spawn;
    var WavPlayer = class {
      /* ------------------------------------------------------------------
      * Constructor: WavPlayer()
      * ---------------------------------------------------------------- */
      constructor() {
        this._OS = process.platform;
        this._proc = null;
        this._called_stop = false;
      }
      /* ------------------------------------------------------------------
      * play(params)
      * - params  | Object  | Required |
      *   - path  | String  | Required | Path of a wav file
      *   - sync  | Boolean | Optional | Default is `false`
      *   - loop  | Boolean | Optional | Default is `false`
      * ---------------------------------------------------------------- */
      async play(params) {
        this._called_stop = false;
        if (!params || typeof params !== "object") {
          throw new Error("The `path` is required.");
        }
        let path2 = "";
        if ("path" in params) {
          path2 = params["path"];
        } else {
          throw new Error("The `path` is required.");
        }
        if (typeof path2 !== "string" || path2 === "") {
          throw new Error("The `path` must be a non-empty string.");
        }
        if (!mFs.existsSync(path2)) {
          throw new Error("The file of the `path` was not found.");
        }
        let sync = false;
        if ("sync" in params) {
          sync = params["sync"];
        }
        if (typeof sync !== "boolean") {
          throw new Error("The `sync` must be a boolean.");
        }
        let loop = false;
        if ("loop" in params) {
          loop = params["loop"];
        }
        if (typeof loop !== "boolean") {
          throw new Error("The `loop` must be a boolean.");
        }
        if (loop) {
          sync = false;
        }
        await this._play({
          path: path2,
          sync,
          loop
        });
      }
      _play(params) {
        return new Promise((resolve, reject) => {
          const path2 = params.path;
          const loop = params.loop;
          const sync = params.sync;
          const os = this._OS;
          if (os === "win32") {
            this._proc = mSpawn("powershell", [
              "-c",
              '(New-Object System.Media.SoundPlayer "' + path2 + '").PlaySync();'
            ]);
            this._proc.stdin.end();
          } else if (os === "darwin") {
            this._proc = mSpawn("afplay", [path2]);
          } else if (os === "linux") {
            this._proc = mSpawn("aplay", [path2]);
          } else {
            reject(new Error("The wav file can not be played on this platform."));
          }
          let timer = null;
          if (!sync) {
            timer = setTimeout(() => {
              if (!loop) {
                this._proc.removeAllListeners("close");
              }
              resolve();
            }, 500);
          }
          this._proc.on("error", function(err) {
            reject(new Error("Failed to play the wav file (" + err + ")"));
          });
          this._proc.on("close", (code) => {
            if (timer) {
              clearTimeout(timer);
            }
            if (this._called_stop === true) {
              resolve();
            } else {
              if (code === 0) {
                if (sync) {
                  resolve();
                } else if (loop) {
                  this._play(params);
                }
              } else {
                reject(new Error("Failed to play the wav file (" + code + ")"));
              }
            }
          });
        });
      }
      stop() {
        this._called_stop = true;
        this._proc.removeAllListeners("close");
        if (this._proc) {
          this._proc.kill();
        }
      }
    };
    module2.exports = new WavPlayer();
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));
var wavPlayer = require_wav_player();
function getRandomSound(folder) {
  if (!fs.existsSync(folder)) return null;
  const files = fs.readdirSync(folder).filter(
    (f) => path.extname(f).toLowerCase() === ".wav"
  );
  if (files.length === 0) return null;
  return path.join(folder, files[Math.floor(Math.random() * files.length)]);
}
function playSound(type, extensionPath) {
  const folder = path.join(extensionPath, "sounds", type);
  const file = getRandomSound(folder);
  if (!file) return;
  wavPlayer.play({ path: file }).catch(
    (err) => console.error(`[SoundFX] Playback failed: ${err.message}`)
  );
}
var cellDebounceMap = /* @__PURE__ */ new Map();
function getCellKey(cell) {
  return `${cell.notebook.uri.toString()}::${cell.index}`;
}
function handleNotebookChange(event, extensionPath) {
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
      const hasError = outputs.some(
        (output) => output.items.some((item) => item.mime === "application/vnd.code.notebook.error")
      );
      playSound(hasError ? "error" : "success", extensionPath);
    }, 300);
    cellDebounceMap.set(key, timer);
  }
}
var enabled = true;
function activate(context) {
  const extPath = context.extensionPath;
  const toggleCmd = vscode.commands.registerCommand("terminalSoundFx.toggle", () => {
    enabled = !enabled;
    vscode.window.showInformationMessage(
      `Terminal Sound FX is now ${enabled ? "\u{1F50A} ON" : "\u{1F507} OFF"}`
    );
  });
  const terminalListener = vscode.window.onDidEndTerminalShellExecution((event) => {
    if (!enabled) return;
    const code = event.exitCode;
    if (code === void 0) return;
    playSound(code === 0 ? "success" : "error", extPath);
  });
  const notebookListener = vscode.workspace.onDidChangeNotebookDocument((event) => {
    if (!enabled) return;
    handleNotebookChange(event, extPath);
  });
  context.subscriptions.push(toggleCmd, terminalListener, notebookListener);
}
function deactivate() {
  for (const timer of cellDebounceMap.values()) clearTimeout(timer);
  cellDebounceMap.clear();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
