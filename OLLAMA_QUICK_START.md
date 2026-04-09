# ScheduleAI with Ollama - Quick Start Guide

## ✅ What Was Changed

Your ScheduleAI application has been successfully migrated from Anthropic Claude to Ollama (local open-source models).

### Files Modified:
- ✅ `backend/package.json` - Removed Anthropic SDK, added axios
- ✅ `backend/.env` - Changed from ANTHROPIC_API_KEY to OLLAMA configuration
- ✅ `backend/.env.example` - Updated template
- ✅ `backend/src/lib/parser.js` - Replaced Claude with Ollama for prompt parsing
- ✅ `backend/src/server.js` - Replaced Claude with Ollama for AI optimization
- ✅ `backend/src/lib/ollamaHelper.js` - NEW helper file for Ollama API calls

## 🚀 Quick Start (5 Minutes)

### Step 1: Download & Install Ollama
1. Go to https://ollama.ai
2. Download and install for your OS (Windows/Mac/Linux)
3. Run Ollama (it will appear in your system tray)

### Step 2: Pull a Model
Open Terminal/PowerShell and run:
```bash
ollama pull neural-chat
```

**First time setup:** This downloads ~6GB of model files (one-time)
**Already have it?** Skip this step

### Step 3: Verify ScheduleAI Backend is Running
The backend should already be running at http://localhost:4000

Check health status:
```bash
curl http://localhost:4000/api/health
```

Response should show: `"ollamaEnabled": true`

### Step 4: Use ScheduleAI!
1. Open http://localhost:5173 in your browser
2. Generate a schedule - it will use Ollama for parsing
3. Click "AI Suggestions" - it will use Ollama for optimization

## 📋 Environment Configuration

Your `.env` file now contains:
```bash
PORT=4000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=neural-chat
```

### To Change Models:
1. List available: `ollama list`
2. Pull new model: `ollama pull mistral`
3. Update .env: `OLLAMA_MODEL=mistral`
4. Restart backend: Ctrl+C and `npm run dev`

## 🤖 Model Options

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **neural-chat** | 6GB | ⚡ Fast | Good | 👈 Recommended |
| phi | 2.7GB | ⚡⚡ Fastest | Fair | Low-resource systems |
| mistral | 5.5GB | ⚡ Fast | Excellent | Better quality needed |
| llama2 | 7.4GB | ⚡ Medium | Good | Balanced |
| openchat | 4.2GB | ⚡⚡ Very Fast | Fair | Ultra-fast |

## 🔧 Troubleshooting

### Error: "Cannot find module 'axios'"
**Solution:** The backend needs to reinstall dependencies
```bash
cd backend
npm install axios
```

### Error: "Connection refused" or "ECONNREFUSED"
**Solution:** Ollama is not running
- Check system tray for Ollama icon
- On Mac/Linux: `ollama serve` in terminal
- Verify: `curl http://localhost:11434/api/tags`

### Error: "No models available"
**Solution:** Pull a model first
```bash
ollama pull neural-chat
```

### Error: "Ollama service not available"
**Solution:** Your Ollama_BASE_URL in .env might be wrong (default: http://localhost:11434)

### Slow responses / High CPU usage
**Solution:** 
- Try a smaller model: `ollama pull phi`
- Close other applications
- Check available RAM (should have 4GB+ free)

## 📊 Performance Expectations

First request takes longer (model loads into RAM):
- **neural-chat**: ~5-10 seconds first request, 2-3s subsequent
- **phi**: ~3-5 seconds first request, 1-2s subsequent

Subsequent requests are much faster while model stays in memory.

## 🛑 How to Stop Everything

### Stop Ollama
- Windows/Mac: Quit from system tray
- Linux: `Ctrl+C` in terminal if running `ollama serve`

### Stop ScheduleAI
```bash
# Backend - press Ctrl+C where "npm run dev" is running
# Frontend - press Ctrl+C where "npm run dev" is running
```

## 📝 Configuration Files

### .env (Backend)
```env
PORT=4000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=neural-chat
```

### Ollama Configuration
- **Default URL:** http://localhost:11434
- **Data stored:** ~/.ollama (auto-created)
- **Models location:** ~/.ollama/models

## 🎯 What Each Feature Uses

1. **"Generate Timetable"** → Uses Ollama's `neural-chat` model to parse course requirements
2. **"AI Suggestions"** → Uses Ollama to analyze and improve the schedule
3. **Fallback Mode** → If Ollama unavailable, uses heuristic parsing (works but less accurate)

## ✨ Next Steps

1. ✅ Install Ollama
2. ✅ Pull neural-chat model
3. ✅ Verify http://localhost:5173 works
4. ✅ Generate some schedules and test AI features!

## 📞 Support

If Ollama stops working:
1. Check it's running: `ollama list`
2. Restart: Quit and restart Ollama
3. Check logs: Backend shows "Ollama status" every request

That's it! You're now running ScheduleAI with 100% local, private AI. No cloud API costs! 🎉
