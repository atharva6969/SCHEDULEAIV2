# Replace Anthropic with Ollama - Exact Steps

## Prerequisites
1. **Download & Install Ollama**: https://ollama.ai
2. **Start Ollama service**: Run Ollama (it will run on `http://localhost:11434`)
3. **Pull a model**: Open terminal and run:
   ```
   ollama pull neural-chat
   ```
   Or use other models: `llama2`, `mistral`, `openchat`, etc.

## Step 1: Update Backend Dependencies

### 1.1 Remove Anthropic SDK
```bash
cd backend
npm uninstall @anthropic-ai/sdk
```

### 1.2 Verify axios is installed (should be)
```bash
npm list axios
```
If not installed:
```bash
npm install axios
```

### 1.3 Update package.json
Your dependencies should now look like:
```json
"dependencies": {
  "axios": "^1.x.x",
  "cors": "^2.8.6",
  "dotenv": "^17.4.1",
  "express": "^5.2.1",
  "ical-generator": "^10.1.0"
}
```

## Step 2: Update .env Configuration

### 2.1 Remove old variable
Delete: `ANTHROPIC_API_KEY=...`

### 2.2 Add Ollama configuration
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=neural-chat
```

## Step 3: Update parser.js

Replace Anthropic import and claudeParse function with Ollama version.

## Step 4: Update server.js

Replace Anthropic usage in /api/optimize/ai endpoint with Ollama version.

## Step 5: Test

1. Restart backend: `npm run dev`
2. Check `/api/health` endpoint - should show `ollamaEnabled: true`
3. Generate a schedule with empty course data - prompt parsing will use Ollama
4. Click "AI Suggestions" button - optimization will use Ollama

## Ollama API Reference

### Basic cURL Example:
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "neural-chat",
  "prompt": "Your prompt here",
  "stream": false
}'
```

### Response Format:
```json
{
  "model": "neural-chat",
  "response": "model response text here...",
  "done": true
}
```

## Optional: Switch Models Later
To switch models without code changes:
```bash
ollama pull mistral
# Then update .env: OLLAMA_MODEL=mistral
```

Available models: llama2, neural-chat, mistral, openchat, dolphin-mixtral, phi

## Troubleshooting

If "Connection refused" error:
- Make sure Ollama is running (check system tray)
- Verify OLLAMA_BASE_URL in .env
- Test: `curl http://localhost:11434/api/tags`

If responses are slow:
- Try a smaller model: `ollama pull phi`
- Check system RAM requirements

If parsing returns null:
- Ensure model is pulled: `ollama list`
- Check model response format in logs
