# CompilerVoice
Plays a sound every time you run code in VS Code — success or error, so you know what happened without even looking at the screen.

Works in:
- Terminal (running Python files, scripts, anything)
- Jupyter Notebook cells (.ipynb)

## Installation
1. Download the `compilervoice-1.0.0.vsix` file
2. Open VS Code
3. Press `Ctrl+Shift+X` to open the Extensions panel
4. Click the `•••` menu at the top right of the panel
5. Click **"Install from VSIX..."**
6. Select the downloaded `.vsix` file
7. Restart VS Code — you're done, it runs automatically from now on

## Toggling On/Off
Press `Ctrl+Shift+P` and type **"CompilerVoice: Toggle On/Off"** → hit Enter.

A notification will confirm whether sounds are now ON or OFF.

## Changing the Sounds

All sounds are `.wav` files inside the extension folder. Navigate to:
```
C:\Users\<your-username>\.vscode\extensions\AbhijayD.compilervoice-1.0.0\sounds\
```

- Drop `.wav` files into `success/` → plays on successful runs
- Drop `.wav` files into `error/` → plays on errors
- Delete any file you don't want
- Multiple files = one picked randomly each time
- No restart needed, changes apply immediately
