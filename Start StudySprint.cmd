@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required for this launcher. Alternatively run: python -m http.server 8000 --bind 127.0.0.1
  pause
  exit /b 1
)
echo Open http://127.0.0.1:8000 in your browser.
echo Keep this window open while using StudySprint. Press Ctrl+C to stop.
node scripts\serve.cjs
