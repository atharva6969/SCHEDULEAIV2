# 🛠️ Ollama Setup - Step-by-Step Commands

## What You Need to Do RIGHT NOW

### For Windows/Mac/Linux Users

#### Step 1: Download Ollama (5 minutes)
```
1. Go to https://ollama.ai
2. Click Download for your OS
3. Run the installer
4. Launch Ollama (it will run in system tray)
```

#### Step 2: Pull a Model to Your Machine (5-10 minutes)
Open PowerShell/Terminal and run:
```powershell
ollama pull neural-chat
```

OR try a faster alternative:
```powershell
ollama pull phi
```

#### Step 3: Verify Everything Works (1 minute)
Test Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

Expected response:
```json
{"models":[{"name":"neural-chat:latest","modified_at":"...","size":...}]}
```

Test Backend:
```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{"ok":true,"name":"ScheduleAI API","ollamaEnabled":true}
```

#### Step 4: Use ScheduleAI!
```
Open: http://localhost:5173
Generate a schedule - Ollama will parse it
Click "AI Suggestions" - Ollama will optimize it
```

---

## If You Have Errors

### Error: "ollama: command not found"
```bash
# Make sure Ollama is running
# Windows: Check system tray for Ollama icon
# Mac/Linux: Run in terminal:
ollama serve
```

### Error: "Connection refused"
```bash
# Ollama isn't running
# Windows/Mac: Start Ollama from Applications
# Linux: Run: ollama serve
```

### Error: "Protocol error" in browser
```bash
# Backend might have crashed
# Kill and restart:
cd backend
npm run dev
```

### Error: "Cannot parse JSON"
```bash
# Model isn't loaded yet, try again
# First request takes 5-10 seconds
# Wait 10 seconds and try generating schedule again
```

---

## To Switch Models

### List what you have:
```bash
ollama list
```

### Get a different model:
```bash
ollama pull mistral
ollama pull llama2
ollama pull phi
```

### Update .env file:
```
OLLAMA_MODEL=mistral
```

### Restart backend:
```bash
# Press Ctrl+C in backend terminal
cd backend
npm run dev
```

---

## Performance Tips

### Speed Up First Request:
```bash
# Keep Ollama running while using ScheduleAI
# First request: ~5 seconds
# Subsequent: ~1-2 seconds
```

### Free Up Resources:
```bash
# Stop Ollama if not using:
# Windows/Mac: Quit from system tray
# Linux: Ctrl+C in ollama serve terminal
```

### Use Faster Model:
```bash
ollama pull phi
# Update OLLAMA_MODEL=phi in .env
```

---

## Common Models & Sizes

```
neural-chat:    6GB    ← Good balance, recommended
phi:            2.7GB  ← Fastest, good for weak PCs
mistral:        5.5GB  ← Highest quality
llama2:         7.4GB  ← Balanced
openchat:       4.2GB  ← Fast & accurate
```

---

## Complete Check List Before Starting

- [ ] Ollama downloaded from https://ollama.ai
- [ ] Ollama running (check system tray / process)
- [ ] Model pulled (`ollama list` shows a model)
- [ ] Backend running (`npm run dev` in backend folder)
- [ ] Frontend running (`npm run dev` in frontend folder)
- [ ] Health check passes (`curl http://localhost:4000/api/health`)
- [ ] Browser at http://localhost:5173 loads

---

## Troubleshooting Checklist

If something doesn't work:

1. **Is Ollama running?**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   If fails → Start Ollama

2. **Is a model installed?**
   ```bash
   ollama list
   ```
   If empty → Run `ollama pull neural-chat`

3. **Is backend running?**
   ```bash
   curl http://localhost:4000/api/health
   ```
   If fails → Run `npm run dev` in backend folder

4. **Is frontend running?**
   ```
   Open http://localhost:5173
   ```
   If fails → Run `npm run dev` in frontend folder

5. **Are you getting the right response?**
   - Health shows `"ollamaEnabled": true` ✅
   - Schedule generation works ✅
   - AI Suggestions available ✅

---

## Environment Variables Explained

In `backend/.env`:

```env
PORT=4000
# ^ Ollama listens on port 4000

OLLAMA_BASE_URL=http://localhost:11434
# ^ Where Ollama HTTP API is running
# Usually always localhost:11434

OLLAMA_MODEL=neural-chat
# ^ Which model to use
# Change this to try: mistral, llama2, phi, etc.
```

---

## How to Completely Uninstall Ollama

```bash
# Windows:
# Start → Settings → Apps → Apps & features → Find Ollama → Uninstall

# Mac:
# Open Finder → Applications → Drag Ollama to Trash

# Linux:
sudo rm -r ~/.ollama  # Remove models
# Then uninstall Ollama package with your package manager
```

---

## Final Checklist - Everything Working? ✅

Test by:
1. Opening http://localhost:5173
2. Adding a teacher and course
3. Clicking "Generate timetable"
4. Waiting 5 seconds
5. Should see schedule generated
6. Click "AI Suggestions" - should get suggestions

**If you see a timetable and AI suggestions... You're Done! 🎉**

---

**That's it! You're running ScheduleAI with 100% local, private, free AI!**
