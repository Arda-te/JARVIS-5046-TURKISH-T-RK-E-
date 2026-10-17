# JARVIS 5046

Futuristic Windows desktop AI assistant. Built with Electron + JavaScript; no Python.

## Requirements
- Windows 10/11
- Node.js LTS (includes npm)
- Internet for npm installation and Groq API requests
- A Groq API key from the official Groq Console for AI chat

## Start
1. Extract the ZIP into a normal folder (not inside a protected Windows directory).
2. Install Node.js LTS if needed: https://nodejs.org/
3. Double-click `BASLAT.bat` or run `npm install` and `npm start` in this folder.
4. Open **Sistem Ayarları**, paste your Groq API key, check the model ID available to your account, then save.

Default model ID is `openai/gpt-oss-120b`. Groq model availability changes; if the API reports that a model is unavailable, use a currently enabled model ID from your Groq Console.

## Build Windows installer
Double-click `KURULUM_EXE_OLUSTUR.bat` or run `npm run dist`. The installer should appear under `release/` if electron-builder completes successfully. First build requires an internet connection.

## Features
- Futuristic animated HUD dashboard
- Groq API-backed AI chat
- Windows/browser speech synthesis for spoken replies
- Browser SpeechRecognition for voice input where supported by the Electron/Windows runtime
- Add and launch selected EXE, LNK, BAT, CMD files
- Remove apps from your personal launcher
- Create a desktop shortcut
- NSIS Windows installer configuration
- API key and settings stored in Electron's userData folder

## Notes
- Fish Audio is not required; Windows speech is the default to avoid Fish Audio account/credit errors.
- Voice recognition support varies by runtime and Windows configuration. If unsupported, use the chat textbox.
- Only add executables you trust. Launching a program runs it with your Windows user's permissions.
- The Groq API key is stored locally in the app's settings file, but is not encrypted by this project. Keep your Windows account secure and never share your key.
- The app does not run arbitrary shell commands from AI messages.
